//
//  MailchimpMCPInstallerApp.swift
//  MailchimpMCPInstaller
//
//  Created by Alien Lifestyles
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    var windowController: InstallerWindowController?
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Create and show the main window
        windowController = InstallerWindowController()
        windowController?.showWindow(nil)
        windowController?.window?.makeKeyAndOrderFront(nil)
    }
    
    func applicationWillTerminate(_ aNotification: Notification) {
        // Cleanup
    }
    
    func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        return true
    }
}

