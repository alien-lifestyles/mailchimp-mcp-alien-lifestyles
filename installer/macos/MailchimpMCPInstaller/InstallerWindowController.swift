//
//  InstallerWindowController.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

enum InstallerState {
    case welcome
    case progress
    case completion
    case error
}

class InstallerWindowController: NSWindowController {
    
    private var currentState: InstallerState = .welcome
    private var installerService: InstallerService?
    private var permissionService: PermissionService?
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        // Configure window
        window?.title = "Mailchimp MCP Installer"
        window?.styleMask = [.titled, .closable]
        window?.isMovableByWindowBackground = true
        window?.center()
        window?.setContentSize(NSSize(width: 600, height: 500))
        window?.minSize = NSSize(width: 600, height: 500)
        
        // Initialize services
        permissionService = PermissionService()
        installerService = InstallerService()
        
        // Show welcome view
        showWelcomeView()
    }
    
    func showWelcomeView() {
        currentState = .welcome
        let welcomeView = WelcomeView()
        welcomeView.delegate = self
        window?.contentView = welcomeView
    }
    
    func showProgressView() {
        currentState = .progress
        let progressView = ProgressView()
        progressView.delegate = self
        window?.contentView = progressView
        
        // Start installation
        startInstallation()
    }
    
    func showCompletionView(validationStatus: ConfigValidationStatus) {
        currentState = .completion
        let completionView = CompletionView(validationStatus: validationStatus)
        completionView.delegate = self
        window?.contentView = completionView
    }
    
    func showErrorView(error: InstallerError) {
        currentState = .error
        let errorView = ErrorView(error: error)
        errorView.delegate = self
        window?.contentView = errorView
    }
    
    private func startInstallation() {
        guard let installerService = installerService,
              let permissionService = permissionService else {
            showErrorView(error: InstallerError.general("Services not initialized"))
            return
        }
        
        // Request permissions first
        permissionService.requestAdminPrivileges { [weak self] success in
            guard let self = self else { return }
            
            if !success {
                self.showErrorView(error: InstallerError.permissionDenied)
                return
            }
            
            // Set up progress callback
            installerService.progressCallback = { [weak self] status in
                DispatchQueue.main.async {
                    if let progressView = self?.window?.contentView as? ProgressView {
                        progressView.updateStatus(status)
                    }
                }
            }
            
            // Start installation process
            installerService.install { [weak self] result in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    
                    switch result {
                    case .success(let validationStatus):
                        self.showCompletionView(validationStatus: validationStatus)
                    case .failure(let error):
                        self.showErrorView(error: error)
                    }
                }
            }
        }
    }
}

extension InstallerWindowController: WelcomeViewDelegate {
    func welcomeViewDidContinue() {
        showProgressView()
    }
}

extension InstallerWindowController: ProgressViewDelegate {
    func progressViewDidCancel() {
        NSApplication.shared.terminate(nil)
    }
}

extension InstallerWindowController: CompletionViewDelegate {
    func completionViewDidClose() {
        NSApplication.shared.terminate(nil)
    }
}

extension InstallerWindowController: ErrorViewDelegate {
    func errorViewDidClose() {
        NSApplication.shared.terminate(nil)
    }
}

