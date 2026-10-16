<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#">
    <head prefix="og: http://ogp.me/ns#">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $baseUrl = rtrim(config('app.url', 'https://portal.suliemani.cloud'), '/');
            if (!str_starts_with($baseUrl, 'http')) {
                $baseUrl = 'https://' . $baseUrl;
            }
            $ogImage = $baseUrl . '/images/whatsapp-thumb.jpg';
            $ogCover = $baseUrl . '/images/og-cover.jpg';
            $siteTitle = 'Dr. Mohammad Sulieman — Official Lecture Portal';
            $siteDesc = 'Official academic portal for Dr. Mohammad Sulieman. Access clinical hematology lectures, diagnostic laboratory manuals, and course cabinets.';
        @endphp

        <!-- Primary WhatsApp & OpenGraph Image (Must be at the top of <head> for WhatsApp scrapers) -->
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:image:url" content="{{ $ogImage }}">
        <meta property="og:image:secure_url" content="{{ $ogImage }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="400">
        <meta property="og:image:height" content="400">
        <meta property="og:image:alt" content="Dr. Mohammad Sulieman Emblem">
        <link rel="image_src" href="{{ $ogImage }}">
        <meta name="image" content="{{ $ogImage }}">

        <!-- Open Graph / WhatsApp / Facebook Core Metadata -->
        <meta property="og:site_name" content="Dr. Mohammad Sulieman Portal">
        <meta property="og:title" content="{{ $siteTitle }}">
        <meta property="og:description" content="{{ $siteDesc }}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ $baseUrl }}">

        <!-- Standard Search & Crawler Meta -->
        <title inertia>{{ config('app.name', $siteTitle) }}</title>
        <meta name="title" content="{{ $siteTitle }}">
        <meta name="description" content="{{ $siteDesc }}">
        <meta name="author" content="Dr. Mohammad Sulieman">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Twitter / X Cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ $baseUrl }}">
        <meta name="twitter:title" content="{{ $siteTitle }}">
        <meta name="twitter:description" content="{{ $siteDesc }}">
        <meta name="twitter:image" content="{{ $ogCover }}">

        <!-- PWA Configuration -->
        <link rel="manifest" href="/manifest.webmanifest">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <meta name="theme-color" content="#e11d48">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Dr. Sulieman Portal">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
