//
//  UninstallerWindowController.swift
//  MailchimpMCPUninstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

enum UninstallerState {
    case confirmation
    case progress
    case completion
    case error
}

class UninstallerWindowController: NSWindowController {
    
    private var currentState: UninstallerState = .confirmation
    private var uninstallerService: UninstallerService?
    private var permissionService: PermissionService?
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        // Configure window
        window?.title = "Mailchimp MCP Uninstaller"
        window?.styleMask = [.titled, .closable]
        window?.isMovableByWindowBackground = true
        window?.center()
        window?.setContentSize(NSSize(width: 600, height: 500))
        window?.minSize = NSSize(width: 600, height: 500)
        
        // Initialize services
        permissionService = PermissionService()
        uninstallerService = UninstallerService()
        
        // Show confirmation view
        showConfirmationView()
    }
    
    func showConfirmationView() {
        currentState = .confirmation
        let confirmationView = ConfirmationView()
        confirmationView.delegate = self
        window?.contentView = confirmationView
    }
    
    func showProgressView() {
        currentState = .progress
        let progressView = ProgressView()
        progressView.delegate = self
        window?.contentView = progressView
        
        // Start uninstallation
        startUninstallation()
    }
    
    func showCompletionView() {
        currentState = .completion
        let completionView = CompletionView()
        completionView.delegate = self
        window?.contentView = completionView
    }
    
    func showErrorView(error: UninstallerError) {
        currentState = .error
        let errorView = ErrorView(error: error)
        errorView.delegate = self
        window?.contentView = errorView
    }
    
    private func startUninstallation() {
        guard let uninstallerService = uninstallerService,
              let permissionService = permissionService else {
            showErrorView(error: UninstallerError.general("Services not initialized"))
            return
        }
        
        // Request permissions first
        permissionService.requestAdminPrivileges { [weak self] success in
            guard let self = self else { return }
            
            if !success {
                self.showErrorView(error: UninstallerError.permissionDenied)
                return
            }
            
            // Set up progress callback
            uninstallerService.progressCallback = { [weak self] status in
                DispatchQueue.main.async {
                    if let progressView = self?.window?.contentView as? ProgressView {
                        progressView.updateStatus(status)
                    }
                }
            }
            
            // Start uninstallation process
            uninstallerService.uninstall { [weak self] result in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    
                    switch result {
                    case .success:
                        self.showCompletionView()
                    case .failure(let error):
                        self.showErrorView(error: error)
                    }
                }
            }
        }
    }
}

extension UninstallerWindowController: ConfirmationViewDelegate {
    func confirmationViewDidConfirm() {
        showProgressView()
    }
    
    func confirmationViewDidCancel() {
        NSApplication.shared.terminate(nil)
    }
}

extension UninstallerWindowController: ProgressViewDelegate {
    func progressViewDidCancel() {
        NSApplication.shared.terminate(nil)
    }
}

extension UninstallerWindowController: CompletionViewDelegate {
    func completionViewDidClose() {
        NSApplication.shared.terminate(nil)
    }
}

extension UninstallerWindowController: ErrorViewDelegate {
    func errorViewDidClose() {
        NSApplication.shared.terminate(nil)
    }
}

