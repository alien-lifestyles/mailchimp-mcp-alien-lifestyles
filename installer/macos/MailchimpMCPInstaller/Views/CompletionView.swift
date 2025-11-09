//
//  CompletionView.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol CompletionViewDelegate: AnyObject {
    func completionViewDidClose()
}

class CompletionView: NSView {
    
    weak var delegate: CompletionViewDelegate?
    private let validationStatus: ConfigValidationStatus
    private var autoCloseTimer: Timer?
    
    private let successIcon: NSImageView = {
        let imageView = NSImageView()
        imageView.image = NSImage(systemSymbolName: "checkmark.circle.fill", accessibilityDescription: "Success")
        imageView.contentTintColor = .systemGreen
        return imageView
    }()
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Installation Complete!")
        label.font = NSFont.systemFont(ofSize: 24, weight: .bold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let messageLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .labelColor
        label.alignment = .center
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let nextStepsLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "")
        label.font = NSFont.systemFont(ofSize: 12)
        label.textColor = .secondaryLabelColor
        label.alignment = .left
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let closeButton: NSButton = {
        let button = NSButton(title: "Close", target: nil, action: nil)
        button.bezelStyle = .rounded
        button.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        return button
    }()
    
    init(validationStatus: ConfigValidationStatus) {
        self.validationStatus = validationStatus
        super.init(frame: .zero)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupView() {
        wantsLayer = true
        layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        
        // Build message
        var message = "Mailchimp MCP has been successfully installed."
        if !validationStatus.warnings.isEmpty {
            message += "\n\nNote: Some warnings were detected during configuration validation."
        }
        messageLabel.stringValue = message
        
        // Build next steps
        var steps = "Next Steps:\n"
        steps += "1. Restart Claude Desktop completely (quit and reopen)\n"
        steps += "2. Ask Claude: \"Can you run mc_ping?\" to test the connection\n"
        if !validationStatus.warnings.isEmpty {
            steps += "\nWarnings:\n"
            for warning in validationStatus.warnings {
                steps += "• \(warning)\n"
            }
        }
        nextStepsLabel.stringValue = steps
        
        addSubview(successIcon)
        addSubview(titleLabel)
        addSubview(messageLabel)
        addSubview(nextStepsLabel)
        addSubview(closeButton)
        
        successIcon.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        nextStepsLabel.translatesAutoresizingMaskIntoConstraints = false
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            successIcon.topAnchor.constraint(equalTo: topAnchor, constant: 60),
            successIcon.centerXAnchor.constraint(equalTo: centerXAnchor),
            successIcon.widthAnchor.constraint(equalToConstant: 64),
            successIcon.heightAnchor.constraint(equalToConstant: 64),
            
            titleLabel.topAnchor.constraint(equalTo: successIcon.bottomAnchor, constant: 20),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            messageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 40),
            messageLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -40),
            
            nextStepsLabel.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 30),
            nextStepsLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 60),
            nextStepsLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -60),
            
            closeButton.topAnchor.constraint(equalTo: nextStepsLabel.bottomAnchor, constant: 30),
            closeButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            closeButton.widthAnchor.constraint(equalToConstant: 200),
            closeButton.heightAnchor.constraint(equalToConstant: 36),
            closeButton.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -40)
        ])
        
        closeButton.target = self
        closeButton.action = #selector(closeButtonClicked)
        
        // Auto-close after 3 seconds
        autoCloseTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { [weak self] _ in
            self?.closeButtonClicked()
        }
    }
    
    @objc private func closeButtonClicked() {
        autoCloseTimer?.invalidate()
        delegate?.completionViewDidClose()
    }
}

