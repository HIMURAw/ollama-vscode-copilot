const vscode = require("vscode");

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "ollama.openChat",
    function () {
      const panel = vscode.window.createWebviewPanel(
        "ollamaCopilot",
        "Ollama Copilot",
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      panel.webview.html = getHtml();

      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.type === "chat") {

          const res = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "deepseek-coder",
              messages: [
                { role: "user", content: message.text }
              ],
              stream: false
            })
          });

          const data = await res.json();

          panel.webview.postMessage({
            type: "response",
            text: data.message.content
          });
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function getHtml() {
  return `
  <html>
  <body style="background:#1e1e1e;color:white;font-family:sans-serif">
    <div id="chat"></div>
    <input id="input" style="width:80%" />
    <button onclick="send()">Send</button>

    <script>
      const vscode = acquireVsCodeApi();

      function send() {
        const input = document.getElementById('input');

        document.getElementById('chat').innerHTML += 
          '<p><b>You:</b> ' + input.value + '</p>';

        vscode.postMessage({
          type: 'chat',
          text: input.value
        });

        input.value = '';
      }

      window.addEventListener('message', event => {
        const msg = event.data;
        if (msg.type === 'response') {
          document.getElementById('chat').innerHTML += 
            '<p><b>AI:</b> ' + msg.text + '</p>';
        }
      });
    </script>
  </body>
  </html>`;
}

exports.activate = activate;