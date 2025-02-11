"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const keys_1 = require("./keys");
const node_fetch_1 = require("node-fetch");
const serverURL = process.env.NODE_ENV === 'production'
    ? 'https://vsc.oasis.sh'
    : 'http://localhost:5000';
class SidebarProvider {
    constructor(_context) {
        this._context = _context;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((msg) => __awaiter(this, void 0, void 0, function* () {
            switch (msg.type) {
                case 'open-login': {
                    const res = yield node_fetch_1.default(`${serverURL}/login-creds`);
                    const { authIdToken } = yield res.json();
                    this._context.globalState.update(keys_1.Keys.auth, authIdToken);
                    vscode.env.openExternal(vscode.Uri.parse(`http://localhost:3000/auth/vscode?t=${authIdToken}`));
                }
                case 'logged-in': {
                    const authToken = this._context.globalState.get(keys_1.Keys.auth) || '';
                    const res = yield node_fetch_1.default(`${serverURL}/get-data`, {
                        headers: {
                            authorization: `Bearer ${authToken}`,
                        },
                    });
                    const data = yield res.json();
                    console.log(data);
                }
            }
        }));
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        let content = fs_1.readFileSync(path_1.join(__dirname, '../vsc-ui/dist/index.html')).toString();
        content = content.replace(/(href|src)\=\"(.*?)\"/g, (_, hrefOrSrc, path) => {
            return `${hrefOrSrc}="${webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'vsc-ui/dist', path))}"`;
        });
        return content;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=Sidebar.js.map