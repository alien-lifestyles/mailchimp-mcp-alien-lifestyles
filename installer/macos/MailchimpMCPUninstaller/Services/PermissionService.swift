//
//  PermissionService.swift
//  MailchimpMCPUninstaller
//
//  Created by Alien Lifestyles
//

import Cocoa
import Security

class PermissionService {
    
    private var authorizationRef: AuthorizationRef?
    
    func requestAdminPrivileges(completion: @escaping (Bool) -> Void) {
        var authRef: AuthorizationRef?
        let status = AuthorizationCreate(nil, nil, AuthorizationFlags(), &authRef)
        
        guard status == errAuthorizationSuccess, let auth = authRef else {
            completion(false)
            return
        }
        
        // Request admin rights
        var authItem = AuthorizationItem(name: kAuthorizationRightExecute, valueLength: 0, value: nil, flags: 0)
        var authRights = AuthorizationRights(count: 1, items: &authItem)
        
        let authFlags: AuthorizationFlags = [.interactionAllowed, .extendRights, .preAuthorize]
        let authStatus = AuthorizationCopyRights(auth, &authRights, nil, authFlags, nil)
        
        if authStatus == errAuthorizationSuccess {
            self.authorizationRef = auth
            completion(true)
        } else {
            completion(false)
        }
    }
    
    func executeWithPrivileges(_ command: String, arguments: [String], completion: @escaping (Bool, String?) -> Void) {
        guard let authRef = authorizationRef else {
            completion(false, "No authorization available")
            return
        }
        
        // Use Process instead of deprecated AuthorizationExecuteWithPrivileges
        let process = Process()
        process.launchPath = command
        process.arguments = arguments
        
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8)
            
            if process.terminationStatus == 0 {
                completion(true, output)
            } else {
                completion(false, output)
            }
        } catch {
            completion(false, error.localizedDescription)
        }
    }
    
    deinit {
        if let authRef = authorizationRef {
            AuthorizationFree(authRef, AuthorizationFlags())
        }
    }
}

