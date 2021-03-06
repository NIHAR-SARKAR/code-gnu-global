import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalDefinitionProvider extends AbstractProvider implements vscode.DefinitionProvider {
	public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
		var self = this;
		return this._global.run(['--encode-path', '" "', '-xa', word])
		.then(function(output){
			console.log(output);

			try {
				var bucket = new Array<any>();
				output.toString().split(/\r?\n/)
				.forEach(function(value, index, array){
					var result = self._global.parseLine(value);
					if (result == null)return;
					
					result.label = result.path;
					result.description = result.info;
					console.log(result.path);
					bucket.push(result);
				});
				
				if (bucket.length == 1) {
					return new vscode.Location(vscode.Uri.file(bucket[0].path), new vscode.Position(bucket[0].line, 0));
				} else if (bucket.length == 0) {
					return null;
				}
				return vscode.window.showQuickPick(bucket).then(value => {
					return new vscode.Location(vscode.Uri.file(value.path), new vscode.Position(value.line, 0));
				});
			}
			catch (ex){
				console.error("Error: " + ex);
			}
			
			return null;
		});
	}
}