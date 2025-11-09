//
//  ConfirmationView.swift
//  MailchimpMCPUninstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol ConfirmationViewDelegate: AnyObject {
    func confirmationViewDidConfirm()
    func confirmationViewDidCancel()
}

class ConfirmationView: NSView {
    
    weak var delegate: ConfirmationViewDelegate?
    
    private let warningIcon: NSImageView = {
        let imageView = NSImageView()
        imageView.image = NSImage(systemSymbolName: "exclamationmark.triangle.fill", accessibilityDescription: "Warning")
        imageView.contentTintColor = .systemOrange
        return imageView
    }()
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Uninstall Mailchimp MCP")
        label.font = NSFont.systemFont(ofSize: 24, weight: .bold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let warningLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "This will completely remove Mailchimp MCP and all associated data from your system, including API keys and configuration files.")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .labelColor
        label.alignment = .center
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let itemsLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: """
        The following will be removed:
        • Mailchimp MCP npm package
        • Claude Desktop configuration entries
        • API keys and license keys from Claude Desktop config
        • .env files (securely deleted)
        """)
        label.font = NSFont.systemFont(ofSize: 12)
        label.textColor = .secondaryLabelColor
        label.alignment = .left
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let confirmButton: NSButton = {
        let button = NSButton(title: "Uninstall", target: nil, action: nil)
        button.bezelStyle = .rounded
        button.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        button.contentTintColor = .systemRed
        return button
    }()
    
    private let cancelButton: NSButton = {
        let button = NSButton(title: "Cancel", target: nil, action: nil)
        button.bezelStyle = .rounded
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
        
        addSubview(warningIcon)
        addSubview(titleLabel)
        addSubview(warningLabel)
        addSubview(itemsLabel)
        addSubview(confirmButton)
        addSubview(cancelButton)
        
        warningIcon.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        warningLabel.translatesAutoresizingMaskIntoConstraints = false
        itemsLabel.translatesAutoresizingMaskIntoConstraints = false
        confirmButton.translatesAutoresizingMaskIntoConstraints = false
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            warningIcon.topAnchor.constraint(equalTo: topAnchor, constant: 60),
            warningIcon.centerXAnchor.constraint(equalTo: centerXAnchor),
            warningIcon.widthAnchor.constraint(equalToConstant: 64),
            warningIcon.heightAnchor.constraint(equalToConstant: 64),
            
            titleLabel.topAnchor.constraint(equalTo: warningIcon.bottomAnchor, constant: 20),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            warningLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 30),
            warningLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 40),
            warningLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -40),
            
            itemsLabel.topAnchor.constraint(equalTo: warningLabel.bottomAnchor, constant: 30),
            itemsLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 80),
            itemsLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -80),
            
            confirmButton.topAnchor.constraint(equalTo: itemsLabel.bottomAnchor, constant: 40),
            confirmButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            confirmButton.widthAnchor.constraint(equalToConstant: 200),
            confirmButton.heightAnchor.constraint(equalToConstant: 36),
            
            cancelButton.topAnchor.constraint(equalTo: confirmButton.bottomAnchor, constant: 12),
            cancelButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            cancelButton.widthAnchor.constraint(equalToConstant: 200),
            cancelButton.heightAnchor.constraint(equalToConstant: 36),
            cancelButton.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -40)
        ])
        
        confirmButton.target = self
        confirmButton.action = #selector(confirmButtonClicked)
        
        cancelButton.target = self
        cancelButton.action = #selector(cancelButtonClicked)
    }
    
    @objc private func confirmButtonClicked() {
        delegate?.confirmationViewDidConfirm()
    }
    
    @objc private func cancelButtonClicked() {
        delegate?.confirmationViewDidCancel()
    }
}

