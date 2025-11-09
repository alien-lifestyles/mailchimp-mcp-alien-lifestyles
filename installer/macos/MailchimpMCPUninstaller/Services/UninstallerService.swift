//
//  UninstallerService.swift
//  MailchimpMCPUninstaller
//
//  Created by Alien Lifestyles
//

import Cocoa
import Foundation

enum UninstallerError: Error {
    case permissionDenied
    case npmUninstallFailed(String)
    case configRemovalFailed(String)
    case fileDeletionFailed(String)
    case general(String)
    
    var localizedDescription: String {
        switch self {
        case .permissionDenied:
            return "Administrator privileges are required to uninstall the package."
        case .npmUninstallFailed(let message):
            return "Failed to uninstall npm package: \(message)"
        case .configRemovalFailed(let message):
            return "Failed to remove Claude Desktop config: \(message)"
        case .fileDeletionFailed(let message):
            return "Failed to delete files: \(message)"
        case .general(let message):
            return message
        }
    }
    
    var contactEmail: String {
        return "michael@alienlifestyles.com"
    }
}

typealias UninstallationResult = Result<Void, UninstallerError>

class UninstallerService {
    
    private let packageName = "@alien-lifestyles/mailchimp-mcp"
    var progressCallback: ((String) -> Void)?
    
    func uninstall(completion: @escaping (UninstallationResult) -> Void) {
        // Step 1: Uninstall npm package
        progressCallback?("Uninstalling npm package...")
        uninstallPackage { [weak self] success, errorMessage in
            guard let self = self else { return }
            
            if !success {
                completion(.failure(.npmUninstallFailed(errorMessage ?? "Unknown error")))
                return
            }
            
            self.progressCallback?("Package uninstalled")
            
            // Step 2: Remove Claude Desktop config
            self.progressCallback?("Removing Claude Desktop configuration...")
            let configResult = self.removeClaudeDesktopConfig()
            if case .failure(let error) = configResult {
                completion(.failure(error))
                return
            }
            
            self.progressCallback?("Configuration removed")
            
            // Step 3: Securely delete .env files
            self.progressCallback?("Securely deleting .env files...")
            let deletionResult = self.securelyDeleteEnvFiles()
            if case .failure(let error) = deletionResult {
                completion(.failure(error))
                return
            }
            
            self.progressCallback?("All files removed")
            completion(.success(()))
        }
    }
    
    private func uninstallPackage(completion: @escaping (Bool, String?) -> Void) {
        let process = Process()
        process.launchPath = "/usr/bin/env"
        process.arguments = ["npm", "uninstall", "-g", packageName]
        
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
    
    private func removeClaudeDesktopConfig() -> Result<Void, UninstallerError> {
        let configPath = getClaudeDesktopConfigPath()
        
        guard FileManager.default.fileExists(atPath: configPath) else {
            // Config doesn't exist, that's okay
            return .success(())
        }
        
        guard let data = FileManager.default.contents(atPath: configPath),
              var json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return .failure(.configRemovalFailed("Config file is not valid JSON"))
        }
        
        // Remove mailchimp-mcp entry
        if var mcpServers = json["mcpServers"] as? [String: Any] {
            mcpServers.removeValue(forKey: "mailchimp-mcp")
            
            // If no MCP servers left, remove the mcpServers object
            if mcpServers.isEmpty {
                json.removeValue(forKey: "mcpServers")
            } else {
                json["mcpServers"] = mcpServers
            }
        }
        
        // Write updated config
        do {
            let updatedData = try JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys])
            try updatedData.write(to: URL(fileURLWithPath: configPath))
            return .success(())
        } catch {
            return .failure(.configRemovalFailed(error.localizedDescription))
        }
    }
    
    private func securelyDeleteEnvFiles() -> Result<Void, UninstallerError> {
        let fileManager = FileManager.default
        
        // Find .env files in common locations
        var envFiles: [String] = []
        
        // Global package directory
        if let globalPath = findGlobalPackagePath() {
            let envPath = (globalPath as NSString).appendingPathComponent(".env")
            if fileManager.fileExists(atPath: envPath) {
                envFiles.append(envPath)
            }
        }
        
        // Home directory
        let homeEnv = (fileManager.homeDirectoryForCurrentUser.path as NSString).appendingPathComponent(".env")
        if fileManager.fileExists(atPath: homeEnv) {
            envFiles.append(homeEnv)
        }
        
        // Securely delete each file
        for envFile in envFiles {
            let result = securelyDeleteFile(at: envFile)
            if case .failure(let error) = result {
                return .failure(error)
            }
        }
        
        return .success(())
    }
    
    private func securelyDeleteFile(at path: String) -> Result<Void, UninstallerError> {
        let fileManager = FileManager.default
        
        guard let fileHandle = FileHandle(forWritingAtPath: path) else {
            // File doesn't exist or can't be opened, try regular deletion
            do {
                try fileManager.removeItem(atPath: path)
                return .success(())
            } catch {
                return .failure(.fileDeletionFailed(error.localizedDescription))
            }
        }
        
        // Get file size
        guard let attributes = try? fileManager.attributesOfItem(atPath: path),
              let fileSize = attributes[.size] as? Int64 else {
            fileHandle.closeFile()
            return .failure(.fileDeletionFailed("Could not determine file size"))
        }
        
        // Overwrite with zeros
        let zeroData = Data(count: Int(fileSize))
        do {
            try fileHandle.write(contentsOf: zeroData)
            fileHandle.closeFile()
            
            // Delete file
            try fileManager.removeItem(atPath: path)
            return .success(())
        } catch {
            fileHandle.closeFile()
            return .failure(.fileDeletionFailed(error.localizedDescription))
        }
    }
    
    private func findGlobalPackagePath() -> String? {
        let process = Process()
        process.launchPath = "/usr/bin/env"
        process.arguments = ["npm", "list", "-g", packageName, "--depth=0", "--json"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            if process.terminationStatus == 0 {
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let dependencies = json["dependencies"] as? [String: Any],
                   let package = dependencies[packageName] as? [String: Any],
                   let resolved = package["resolved"] as? String {
                    return resolved
                }
            }
        } catch {
            // Ignore
        }
        
        // Try common locations
        let fileManager = FileManager.default
        let commonPaths = [
            "/usr/local/lib/node_modules/\(packageName)",
            "\(fileManager.homeDirectoryForCurrentUser.path)/.npm-global/lib/node_modules/\(packageName)"
        ]
        
        for path in commonPaths {
            if fileManager.fileExists(atPath: path) {
                return path
            }
        }
        
        return nil
    }
    
    private func getClaudeDesktopConfigPath() -> String {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return home.appendingPathComponent("Library/Application Support/Claude/claude_desktop_config.json").path
    }
}

