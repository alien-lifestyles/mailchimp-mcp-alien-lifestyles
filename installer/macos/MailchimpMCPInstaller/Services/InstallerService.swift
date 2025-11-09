//
//  InstallerService.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa
import Foundation

enum InstallerError: Error {
    case nodeNotFound
    case nodeVersionTooOld(String)
    case npmNotFound
    case installationFailed(String)
    case permissionDenied
    case configValidationFailed(String)
    case general(String)
    
    var localizedDescription: String {
        switch self {
        case .nodeNotFound:
            return "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
        case .nodeVersionTooOld(let version):
            return "Node.js version \(version) is too old. Node.js 20+ is required. Please upgrade from https://nodejs.org/"
        case .npmNotFound:
            return "npm is not installed. npm comes with Node.js."
        case .installationFailed(let message):
            return "Package installation failed: \(message)"
        case .permissionDenied:
            return "Administrator privileges are required to install the package globally."
        case .configValidationFailed(let message):
            return "Configuration validation failed: \(message)"
        case .general(let message):
            return message
        }
    }
    
    var contactEmail: String {
        return "michael@alienlifestyles.com"
    }
}

struct ConfigValidationStatus {
    let isValid: Bool
    let warnings: [String]
    let configPath: String?
}

typealias InstallationResult = Result<ConfigValidationStatus, InstallerError>

class InstallerService {
    
    private let packageName = "@alien-lifestyles/mailchimp-mcp"
    var progressCallback: ((String) -> Void)?
    
    func install(completion: @escaping (InstallationResult) -> Void) {
        // Step 1: Check prerequisites
        progressCallback?("Checking prerequisites...")
        guard let nodeVersion = checkNodeVersion() else {
            completion(.failure(.nodeNotFound))
            return
        }
        
        progressCallback?("Node.js \(nodeVersion) found")
        
        guard checkNpm() else {
            completion(.failure(.npmNotFound))
            return
        }
        
        progressCallback?("npm found")
        
        // Step 2: Install package
        progressCallback?("Installing Mailchimp MCP package...")
        installPackage { [weak self] success, errorMessage in
            guard let self = self else { return }
            
            if !success {
                completion(.failure(.installationFailed(errorMessage ?? "Unknown error")))
                return
            }
            
            self.progressCallback?("Package installed successfully")
            
            // Step 3: Launch setup UI
            self.progressCallback?("Launching setup UI...")
            self.launchSetupUI()
            
            // Step 4: Validate config
            self.progressCallback?("Validating Claude Desktop configuration...")
            let validationStatus = self.validateClaudeDesktopConfig()
            completion(.success(validationStatus))
        }
    }
    
    private func checkNodeVersion() -> String? {
        let process = Process()
        process.launchPath = "/usr/bin/which"
        process.arguments = ["node"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            if process.terminationStatus != 0 {
                return nil
            }
            
            // Check version
            let versionProcess = Process()
            versionProcess.launchPath = "/usr/bin/env"
            versionProcess.arguments = ["node", "--version"]
            
            let versionPipe = Pipe()
            versionProcess.standardOutput = versionPipe
            
            try versionProcess.run()
            versionProcess.waitUntilExit()
            
            let data = versionPipe.fileHandleForReading.readDataToEndOfFile()
            guard let versionString = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) else {
                return nil
            }
            
            // Parse version (format: v20.0.0)
            let version = versionString.replacingOccurrences(of: "v", with: "")
            let components = version.split(separator: ".").compactMap { Int($0) }
            
            if components.count >= 1, let major = components.first, major >= 20 {
                return versionString
            } else {
                return nil
            }
        } catch {
            return nil
        }
    }
    
    private func checkNpm() -> Bool {
        let process = Process()
        process.launchPath = "/usr/bin/which"
        process.arguments = ["npm"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            return process.terminationStatus == 0
        } catch {
            return false
        }
    }
    
    private func installPackage(completion: @escaping (Bool, String?) -> Void) {
        let process = Process()
        process.launchPath = "/usr/bin/env"
        process.arguments = ["npm", "install", "-g", packageName]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            if process.terminationStatus == 0 {
                completion(true, nil)
            } else {
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                completion(false, errorMessage)
            }
        } catch {
            completion(false, error.localizedDescription)
        }
    }
    
    private func launchSetupUI() {
        // Launch the setup UI in background
        DispatchQueue.global(qos: .background).async {
            let process = Process()
            process.launchPath = "/usr/bin/env"
            process.arguments = ["mailchimp-mcp-setup"]
            
            do {
                try process.run()
            } catch {
                // Setup UI launch is not critical, continue
                print("Warning: Could not launch setup UI: \(error)")
            }
        }
    }
    
    private func validateClaudeDesktopConfig() -> ConfigValidationStatus {
        let configPath = getClaudeDesktopConfigPath()
        var warnings: [String] = []
        
        guard FileManager.default.fileExists(atPath: configPath) else {
            return ConfigValidationStatus(
                isValid: false,
                warnings: ["Claude Desktop config file not found at: \(configPath)"],
                configPath: configPath
            )
        }
        
        guard let data = FileManager.default.contents(atPath: configPath),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ConfigValidationStatus(
                isValid: false,
                warnings: ["Claude Desktop config file is not valid JSON"],
                configPath: configPath
            )
        }
        
        guard let mcpServers = json["mcpServers"] as? [String: Any],
              let mailchimpConfig = mcpServers["mailchimp-mcp"] as? [String: Any] else {
            return ConfigValidationStatus(
                isValid: false,
                warnings: ["mailchimp-mcp entry not found in Claude Desktop config"],
                configPath: configPath
            )
        }
        
        // Validate paths
        if let command = mailchimpConfig["command"] as? String {
            if !FileManager.default.fileExists(atPath: command) {
                warnings.append("Node executable not found at: \(command)")
            }
        }
        
        if let args = mailchimpConfig["args"] as? [String], !args.isEmpty {
            let indexPath = args[0]
            if !FileManager.default.fileExists(atPath: indexPath) {
                warnings.append("Package index.js not found at: \(indexPath)")
            }
        }
        
        // Check environment variables
        if let env = mailchimpConfig["env"] as? [String: String] {
            if env["MAILCHIMP_API_KEY"] == nil {
                warnings.append("MAILCHIMP_API_KEY not set in config")
            }
        }
        
        return ConfigValidationStatus(
            isValid: warnings.isEmpty,
            warnings: warnings,
            configPath: configPath
        )
    }
    
    private func getClaudeDesktopConfigPath() -> String {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return home.appendingPathComponent("Library/Application Support/Claude/claude_desktop_config.json").path
    }
}

