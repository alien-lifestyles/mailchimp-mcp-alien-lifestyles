//
//  ProgressView.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol ProgressViewDelegate: AnyObject {
    func progressViewDidCancel()
}

class ProgressView: NSView {
    
    weak var delegate: ProgressViewDelegate?
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Installing Mailchimp MCP...")
        label.font = NSFont.systemFont(ofSize: 20, weight: .semibold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let statusLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Checking prerequisites...")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .secondaryLabelColor
        label.alignment = .center
        return label
    }()
    
    private let progressIndicator: NSProgressIndicator = {
        let indicator = NSProgressIndicator()
        indicator.style = .spinning
        indicator.isIndeterminate = true
        indicator.controlSize = .regular
        return indicator
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
        
        addSubview(titleLabel)
        addSubview(statusLabel)
        addSubview(progressIndicator)
        addSubview(cancelButton)
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        progressIndicator.translatesAutoresizingMaskIntoConstraints = false
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 100),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            statusLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            statusLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            statusLabel.leadingAnchor.constraint(greaterThanOrEqualTo: leadingAnchor, constant: 40),
            statusLabel.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor, constant: -40),
            
            progressIndicator.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 40),
            progressIndicator.centerXAnchor.constraint(equalTo: centerXAnchor),
            progressIndicator.widthAnchor.constraint(equalToConstant: 32),
            progressIndicator.heightAnchor.constraint(equalToConstant: 32),
            
            cancelButton.topAnchor.constraint(equalTo: progressIndicator.bottomAnchor, constant: 40),
            cancelButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            cancelButton.widthAnchor.constraint(equalToConstant: 120),
            cancelButton.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -40)
        ])
        
        progressIndicator.startAnimation(nil)
        
        cancelButton.target = self
        cancelButton.action = #selector(cancelButtonClicked)
    }
    
    func updateStatus(_ status: String) {
        DispatchQueue.main.async {
            self.statusLabel.stringValue = status
        }
    }
    
    @objc private func cancelButtonClicked() {
        delegate?.progressViewDidCancel()
    }
}

