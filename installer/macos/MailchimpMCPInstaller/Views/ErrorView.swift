//
//  ErrorView.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol ErrorViewDelegate: AnyObject {
    func errorViewDidClose()
}

class ErrorView: NSView {
    
    weak var delegate: ErrorViewDelegate?
    private let error: InstallerError
    
    private let errorIcon: NSImageView = {
        let imageView = NSImageView()
        imageView.image = NSImage(systemSymbolName: "exclamationmark.triangle.fill", accessibilityDescription: "Error")
        imageView.contentTintColor = .systemRed
        return imageView
    }()
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Installation Failed")
        label.font = NSFont.systemFont(ofSize: 24, weight: .bold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let errorMessageLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .labelColor
        label.alignment = .center
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let contactLabel: NSTextField = {
        let label = NSTextField(labelWithString: "If you need assistance, please contact:")
        label.font = NSFont.systemFont(ofSize: 12)
        label.textColor = .secondaryLabelColor
        label.alignment = .center
        return label
    }()
    
    private let emailLabel: NSTextField = {
        let label = NSTextField(labelWithString: "")
        label.font = NSFont.systemFont(ofSize: 13, weight: .medium)
        label.textColor = .linkColor
        label.alignment = .center
        label.isSelectable = true
        return label
    }()
    
    private let copyButton: NSButton = {
        let button = NSButton(title: "Copy Error Details", target: nil, action: nil)
        button.bezelStyle = .rounded
        return button
    }()
    
    private let closeButton: NSButton = {
        let button = NSButton(title: "Close", target: nil, action: nil)
        button.bezelStyle = .rounded
        button.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        return button
    }()
    
    init(error: InstallerError) {
        self.error = error
        super.init(frame: .zero)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupView() {
        wantsLayer = true
        layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        
        errorMessageLabel.stringValue = error.localizedDescription
        emailLabel.stringValue = error.contactEmail
        
        addSubview(errorIcon)
        addSubview(titleLabel)
        addSubview(errorMessageLabel)
        addSubview(contactLabel)
        addSubview(emailLabel)
        addSubview(copyButton)
        addSubview(closeButton)
        
        errorIcon.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        errorMessageLabel.translatesAutoresizingMaskIntoConstraints = false
        contactLabel.translatesAutoresizingMaskIntoConstraints = false
        emailLabel.translatesAutoresizingMaskIntoConstraints = false
        copyButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            errorIcon.topAnchor.constraint(equalTo: topAnchor, constant: 60),
            errorIcon.centerXAnchor.constraint(equalTo: centerXAnchor),
            errorIcon.widthAnchor.constraint(equalToConstant: 64),
            errorIcon.heightAnchor.constraint(equalToConstant: 64),
            
            titleLabel.topAnchor.constraint(equalTo: errorIcon.bottomAnchor, constant: 20),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            errorMessageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 30),
            errorMessageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 40),
            errorMessageLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -40),
            
            contactLabel.topAnchor.constraint(equalTo: errorMessageLabel.bottomAnchor, constant: 40),
            contactLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            emailLabel.topAnchor.constraint(equalTo: contactLabel.bottomAnchor, constant: 8),
            emailLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            copyButton.topAnchor.constraint(equalTo: emailLabel.bottomAnchor, constant: 30),
            copyButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            copyButton.widthAnchor.constraint(equalToConstant: 180),
            
            closeButton.topAnchor.constraint(equalTo: copyButton.bottomAnchor, constant: 20),
            closeButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            closeButton.widthAnchor.constraint(equalToConstant: 200),
            closeButton.heightAnchor.constraint(equalToConstant: 36),
            closeButton.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -40)
        ])
        
        copyButton.target = self
        copyButton.action = #selector(copyErrorDetails)
        
        closeButton.target = self
        closeButton.action = #selector(closeButtonClicked)
    }
    
    @objc private func copyErrorDetails() {
        let errorDetails = """
        Mailchimp MCP Installer Error
        
        Error: \(error.localizedDescription)
        Contact: \(error.contactEmail)
        Timestamp: \(Date())
        System: \(ProcessInfo.processInfo.operatingSystemVersionString)
        """
        
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(errorDetails, forType: .string)
        
        // Show brief confirmation
        copyButton.title = "Copied!"
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.copyButton.title = "Copy Error Details"
        }
    }
    
    @objc private func closeButtonClicked() {
        delegate?.errorViewDidClose()
    }
}

