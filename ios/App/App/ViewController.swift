import UIKit
import WebKit
import Capacitor

class ViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor(red: 25/255.0, green: 25/255.0, blue: 25/255.0, alpha: 1.0)
    }

    override func webView(with configuration: WKWebViewConfiguration) -> WKWebView {
        // 1. Force desktop content mode in WebKit
        if #available(iOS 13.0, *) {
            configuration.defaultWebpagePreferences.preferredContentMode = .desktop
        }

        // 2. Inject NotionFlow dynamic engine script
        if let scriptPath = Bundle.main.path(forResource: "notionflow-injection", ofType: "js", inDirectory: "public"),
           let scriptSource = try? String(contentsOfFile: scriptPath, encoding: .utf8) {
            let userScript = WKUserScript(
                source: scriptSource,
                injectionTime: .atDocumentEnd,
                forMainFrameOnly: false
            )
            configuration.userContentController.addUserScript(userScript)
            print("[NotionFlow iOS] Injected notionflow-injection.js into WKUserContentController")
        }

        let webView = super.webView(with: configuration)

        // 3. Set desktop macOS Safari User-Agent
        webView.customUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15 NotionFlow/1.0"
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        webView.scrollView.contentInsetAdjustmentBehavior = .always

        return webView
    }
}
