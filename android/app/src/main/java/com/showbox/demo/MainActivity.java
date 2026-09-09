package com.showbox.demo;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

/**
 * The ShowBox app, fully self-contained: the whole demo (interface and the placeholder catalogue)
 * is packed into the APK and served to the WebView from a private origin, so it opens instantly
 * and needs no server. Only the video clips stream from the internet. This shell adds what a
 * browser cannot: screenshot blocking, the hardware back button, and keeping the screen awake
 * while an episode plays.
 */
public class MainActivity extends Activity {

    private static final long SPLASH_MAX_MS = 6000;

    private AssetServer assetServer;
    private WebView web;
    private FrameLayout root;
    private View splash;

    private boolean pageReady;
    private long lastBackPress;
    private int insetTop, insetBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        assetServer = new AssetServer(getAssets());
        getWindow().setBackgroundDrawableResource(R.color.bg);
        goEdgeToEdge();
        buildUi();
        web.loadUrl(AssetServer.START_URL);
    }

    // --- window ---

    private void goEdgeToEdge() {
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void buildUi() {
        pageReady = false;
        root = new FrameLayout(this);
        root.setBackgroundColor(0xFF0C0818);

        web = new WebView(this);
        web.setBackgroundColor(0xFF0C0818);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " ShowBoxApp/" + versionName());
        WebView.setWebContentsDebuggingEnabled(true);

        web.addJavascriptInterface(new Bridge(this), "AndroidHost");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.deny();
            }
        });

        root.addView(web);

        // Branded cover until the first paint.
        splash = new View(this);
        splash.setBackgroundResource(R.drawable.splash);
        root.addView(splash, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int top, bottom;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets i = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                top = i.top;
                bottom = i.bottom;
            } else {
                top = insets.getSystemWindowInsetTop();
                bottom = insets.getSystemWindowInsetBottom();
            }
            float d = getResources().getDisplayMetrics().density;
            insetTop = Math.round(top / d);
            insetBottom = Math.round(bottom / d);
            if (pageReady) injectEnvironment();
            return insets;
        });

        setContentView(root);

        // The cover can never stick, whatever happens to the page.
        root.postDelayed(this::hideSplash, SPLASH_MAX_MS);
    }

    /** Hands the web app its safe-area insets and tells it that it is running inside the app. */
    private void injectEnvironment() {
        String js = "(function(){try{var d=document.documentElement;"
                + "d.style.setProperty('--sat','max(" + insetTop + "px, 12px)');"
                + "d.style.setProperty('--sab','" + insetBottom + "px');"
                + "d.setAttribute('data-native','android');"
                + "}catch(e){}})();";
        web.evaluateJavascript(js, null);
    }

    private void hideSplash() {
        if (splash == null || splash.getVisibility() != View.VISIBLE) return;
        splash.animate().alpha(0f).setDuration(260)
                .withEndAction(() -> splash.setVisibility(View.GONE)).start();
    }

    private String versionName() {
        try {
            String v = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            return v != null ? v : "1.0";
        } catch (PackageManager.NameNotFoundException e) {
            return "1.0";
        }
    }

    private class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if (u != null && AssetServer.HOST.equals(u.getHost())) {
                return assetServer.serve(u.getPath());
            }
            return null;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if (u == null || AssetServer.HOST.equals(u.getHost())) return false;
            // Anything outside the app is a link for the phone's browser.
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, u));
            } catch (Exception ignored) {
                // no app for this link
            }
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            pageReady = true;
            injectEnvironment();
            view.postDelayed(MainActivity.this::hideSplash, 120);
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            // Without this the whole app is killed when the web renderer dies.
            if (web != null) {
                root.removeView(web);
                web.destroy();
                web = null;
            }
            buildUi();
            web.loadUrl(AssetServer.START_URL);
            return true;
        }
    }

    // --- lifecycle ---

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            root.removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (web == null) {
            super.onBackPressed();
            return;
        }
        // Ask the app first: it closes sheets, pops screens and returns to Home before we exit.
        web.evaluateJavascript(
                "(function(){try{return !!(window.showboxBack && window.showboxBack());}catch(e){return false;}})()",
                value -> {
                    if (!"true".equals(value)) confirmExit();
                });
    }

    private void confirmExit() {
        long now = System.currentTimeMillis();
        if (now - lastBackPress < 2200) {
            finish();
            return;
        }
        lastBackPress = now;
        Toast.makeText(this, "Press back again to leave ShowBox", Toast.LENGTH_SHORT).show();
    }

    // --- what the web app can ask the phone to do ---
    // Public and static on purpose: the WebView reaches these by reflection.

    public static class Bridge {

        private final MainActivity a;

        Bridge(MainActivity a) {
            this.a = a;
        }

        @JavascriptInterface
        public String platform() {
            return "android";
        }

        @JavascriptInterface
        public String appVersion() {
            return a.versionName();
        }

        /** Real screenshot and screen-recording blocking, the same flag banking apps use. */
        @JavascriptInterface
        public void setSecure(final boolean on) {
            a.runOnUiThread(() -> {
                if (on) {
                    a.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                } else {
                    a.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                }
            });
        }

        @JavascriptInterface
        public void setKeepAwake(final boolean on) {
            a.runOnUiThread(() -> {
                if (on) {
                    a.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } else {
                    a.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public void vibrate(final int ms) {
            try {
                Vibrator v = (Vibrator) a.getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                int d = Math.max(1, Math.min(120, ms));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(d, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(d);
                }
            } catch (Exception ignored) {
                // no vibrator on this device
            }
        }

        @JavascriptInterface
        public void reload() {
            a.runOnUiThread(() -> {
                if (a.web != null) a.web.reload();
            });
        }
    }
}
