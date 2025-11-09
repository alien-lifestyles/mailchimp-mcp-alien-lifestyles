//
//  WelcomeView.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

protocol WelcomeViewDelegate: AnyObject {
    func welcomeViewDidContinue()
}

class WelcomeView: NSView {
    
    weak var delegate: WelcomeViewDelegate?
    private var termsAccepted = false
    
    private let titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Mailchimp MCP Installer")
        label.font = NSFont.systemFont(ofSize: 28, weight: .bold)
        label.textColor = .labelColor
        label.alignment = .center
        return label
    }()
    
    private let subtitleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "Powered by Alien Lifestyles")
        label.font = NSFont.systemFont(ofSize: 14)
        label.textColor = .secondaryLabelColor
        label.alignment = .center
        return label
    }()
    
    private let descriptionLabel: NSTextField = {
        let label = NSTextField(wrappingLabelWithString: "This installer will set up Mailchimp MCP for Claude Desktop. You'll be able to manage your Mailchimp account directly from Claude.")
        label.font = NSFont.systemFont(ofSize: 13)
        label.textColor = .labelColor
        label.alignment = .center
        label.maximumNumberOfLines = 0
        return label
    }()
    
    private let termsCheckbox: NSButton = {
        let button = NSButton(checkboxWithTitle: "I have read and agree to the Terms of Service", target: nil, action: nil)
        button.font = NSFont.systemFont(ofSize: 12)
        return button
    }()
    
    private let termsLinkButton: NSButton = {
        let button = NSButton(title: "View Terms of Service", target: nil, action: nil)
        button.bezelStyle = .link
        button.font = NSFont.systemFont(ofSize: 12)
        return button
    }()
    
    private let continueButton: NSButton = {
        let button = NSButton(title: "Continue", target: nil, action: nil)
        button.bezelStyle = .rounded
        button.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        button.isEnabled = false
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
        
        // Add subviews
        addSubview(titleLabel)
        addSubview(subtitleLabel)
        addSubview(descriptionLabel)
        addSubview(termsCheckbox)
        addSubview(termsLinkButton)
        addSubview(continueButton)
        
        // Setup constraints
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        termsCheckbox.translatesAutoresizingMaskIntoConstraints = false
        termsLinkButton.translatesAutoresizingMaskIntoConstraints = false
        continueButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            // Title
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 60),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            // Subtitle
            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            subtitleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            // Description
            descriptionLabel.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 40),
            descriptionLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 40),
            descriptionLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -40),
            
            // Terms checkbox
            termsCheckbox.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 50),
            termsCheckbox.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            // Terms link
            termsLinkButton.topAnchor.constraint(equalTo: termsCheckbox.bottomAnchor, constant: 8),
            termsLinkButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            // Continue button
            continueButton.topAnchor.constraint(equalTo: termsLinkButton.bottomAnchor, constant: 40),
            continueButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            continueButton.widthAnchor.constraint(equalToConstant: 200),
            continueButton.heightAnchor.constraint(equalToConstant: 36),
            continueButton.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -40)
        ])
        
        // Setup actions
        termsCheckbox.target = self
        termsCheckbox.action = #selector(termsCheckboxChanged)
        
        termsLinkButton.target = self
        termsLinkButton.action = #selector(openTerms)
        
        continueButton.target = self
        continueButton.action = #selector(continueButtonClicked)
    }
    
    @objc private func termsCheckboxChanged() {
        termsAccepted = termsCheckbox.state == .on
        continueButton.isEnabled = termsAccepted
    }
    
    @objc private func openTerms() {
        // TODO: Replace with actual terms URL
        let termsURL = URL(string: "https://alienlifestyles.com/terms") ?? URL(string: "https://alienlifestyles.com")!
        NSWorkspace.shared.open(termsURL)
    }
    
    @objc private func continueButtonClicked() {
        guard termsAccepted else { return }
        delegate?.welcomeViewDidContinue()
    }
}

