//
//  CompletionView.swift
//  MailchimpMCPUninstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol CompletionViewDelegate: AnyObject {
    func completionViewDidClose()
}

class CompletionView: NSView {
    
    weak var delegate: CompletionViewDelegate?
    private var autoCloseTimer: Timer?
    
    private let successIcon: NSImageView = {
        let imageView = NSImageView()
        imageView.image = NSImage(systemSymbolName: "checkmark.circle.fill", accessibilityDescription: "Success")
        imageView.contentTintColor = .systemGreen
        return imageView
    }()
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Uninstallation Complete!")
        label.font = NSFont.systemFont(ofSize: 24, weight: .bold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let messageLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "Mailchimp MCP has been completely removed from your system.\n\nAll files, configuration entries, and sensitive data (including API keys) have been securely deleted.")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .labelColor
        label.alignment = .center
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let closeButton: NSButton = {
        let button = NSButton(title: "Close", target: nil, action: nil)
        button.bezelStyle = .rounded
        button.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        return button
    }()
    
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }
    
    private func setupView() {
        wantsLayer = true
        layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        
        addSubview(successIcon)
        addSubview(titleLabel)
        addSubview(messageLabel)
        addSubview(closeButton)
        
        successIcon.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            successIcon.topAnchor.constraint(equalTo: topAnchor, constant: 100),
            successIcon.centerXAnchor.constraint(equalTo: centerXAnchor),
            successIcon.widthAnchor.constraint(equalToConstant: 64),
            successIcon.heightAnchor.constraint(equalToConstant: 64),
            
            titleLabel.topAnchor.constraint(equalTo: successIcon.bottomAnchor, constant: 20),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            messageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 30),
            messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 40),
            messageLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -40),
            
            closeButton.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 40),
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

