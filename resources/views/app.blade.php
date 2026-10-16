<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Dr. Mohammad Sulieman — Lecture Portal') }}</title>
        <meta name="description" content="This is the official website for Dr. Mohammad Sulieman. He will share his lectures, course materials, assignments, and academic announcements with you through it.">
        <meta name="author" content="Dr. Mohammad Sulieman">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            $baseUrl = rtrim(config('app.url', 'https://portal.suliemani.cloud'), '/');
            if (!str_starts_with($baseUrl, 'http')) {
                $baseUrl = 'https://' . $baseUrl;
            }
            $ogImageCover = $baseUrl . '/images/og-cover.jpg';
            $ogImageSquare = $baseUrl . '/images/whatsapp-thumb.jpg';
        @endphp

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ $baseUrl }}">
        <meta property="og:site_name" content="Dr. Mohammad Sulieman — Official Lecture Portal">
        <meta property="og:title" content="Dr. Mohammad Sulieman — Official Lecture Portal">
        <meta property="og:description" content="This is the official website for Dr. Mohammad Sulieman. He will share his lectures, course materials, assignments, and academic announcements with you through it.">
        <meta property="og:image" content="{{ $ogImageCover }}">
        <meta property="og:image:secure_url" content="{{ $ogImageCover }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="675">
        <meta property="og:image:alt" content="Dr. Mohammad Sulieman — Official Lecture Portal">

        <!-- Additional Square OG Image optimized for WhatsApp mobile thumbnails -->
        <meta property="og:image" content="{{ $ogImageSquare }}">
        <meta property="og:image:secure_url" content="{{ $ogImageSquare }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="400">
        <meta property="og:image:height" content="400">
        <meta property="og:image:alt" content="Dr. Mohammad Sulieman Logo">

        <!-- WhatsApp & Legacy Crawlers Thumbnail -->
        <link rel="image_src" href="{{ $ogImageSquare }}">

        <!-- Twitter / X Cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ $baseUrl }}">
        <meta name="twitter:title" content="Dr. Mohammad Sulieman — Official Lecture Portal">
        <meta name="twitter:description" content="This is the official website for Dr. Mohammad Sulieman. He will share his lectures, course materials, assignments, and academic announcements with you through it.">
        <meta name="twitter:image" content="{{ $ogImageCover }}">

        <!-- PWA Configuration -->
        <link rel="manifest" href="/manifest.webmanifest">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <meta name="theme-color" content="#ff5e36">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
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
