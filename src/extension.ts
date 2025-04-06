import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) { return; }

  const projectPath = workspaceFolders[0].uri.fsPath;

  // Écoute les sauvegardes de fichiers
  const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.languageId !== 'dart') { return; }

    // Analyse silencieuse du code
    exec('dart analyze', { cwd: projectPath }, (err, stdout) => {
      if (stdout.includes('prefer_const_constructors') || stdout.includes('info • Use')) {
        // Applique les corrections + formattage
        exec('dart fix --apply', { cwd: projectPath }, () => {
          exec('flutter format .', { cwd: projectPath });
        });
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
