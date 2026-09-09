package com.showbox.demo;

import android.content.res.AssetManager;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Serves the built web app out of the APK on a real https origin, so the interface is on screen
 * before any network call happens. Only the library listing, artwork and video come from the host.
 */
final class AssetServer {

    /** Reserved by Google for exactly this; it never resolves on the public internet. */
    static final String HOST = "appassets.androidplatform.net";
    static final String START_URL = "https://" + HOST + "/demo/";

    private final AssetManager assets;

    AssetServer(AssetManager assets) {
        this.assets = assets;
    }

    WebResourceResponse serve(String urlPath) {
        String p = urlPath == null ? "/" : urlPath;
        if (p.startsWith("/")) p = p.substring(1);
        if (p.startsWith("demo/")) p = p.substring("demo/".length());
        if (p.isEmpty() || p.endsWith("/")) p = p + "index.html";

        String file = "web/" + p;
        InputStream in = open(file);
        if (in == null && !p.contains(".")) {
            // Single-page app: anything that is not a file is the app itself.
            file = "web/index.html";
            in = open(file);
        }

        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");

        if (in == null) {
            headers.put("Cache-Control", "no-store");
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers,
                    new ByteArrayInputStream("Not found".getBytes(StandardCharsets.UTF_8)));
        }

        // Vite fingerprints everything under assets/, so it can be cached forever.
        headers.put("Cache-Control", file.contains("/assets/")
                ? "public, max-age=31536000, immutable"
                : "no-cache");

        String mime = mime(file);
        String encoding = mime.startsWith("text/")
                || mime.contains("javascript")
                || mime.contains("json")
                || mime.contains("svg") ? "utf-8" : null;
        return new WebResourceResponse(mime, encoding, 200, "OK", headers, in);
    }

    private InputStream open(String file) {
        try {
            return assets.open(file);
        } catch (IOException e) {
            return null;
        }
    }

    private static String mime(String f) {
        String n = f.toLowerCase();
        if (n.endsWith(".html")) return "text/html";
        if (n.endsWith(".js") || n.endsWith(".mjs")) return "text/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".json") || n.endsWith(".map")) return "application/json";
        if (n.endsWith(".webmanifest")) return "application/manifest+json";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".gif")) return "image/gif";
        if (n.endsWith(".ico")) return "image/x-icon";
        if (n.endsWith(".woff2")) return "font/woff2";
        if (n.endsWith(".woff")) return "font/woff";
        if (n.endsWith(".ttf")) return "font/ttf";
        if (n.endsWith(".mp4")) return "video/mp4";
        if (n.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }
}
