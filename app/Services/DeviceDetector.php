<?php

namespace App\Services;

class DeviceDetector
{
    /**
     * Detect a friendly, accurate device name from user-agent string and optional client hints.
     */
    public static function detect(?string $userAgent, ?string $clientHintModel = null, ?string $clientHintPlatform = null): string
    {
        if (empty($userAgent)) {
            return 'Unknown Device';
        }

        // If client-side provided a high-entropy model hint (e.g. from navigator.userAgentData)
        if (! empty($clientHintModel)) {
            $mappedModel = self::mapAndroidModel($clientHintModel);
            if ($mappedModel) {
                return $mappedModel;
            }
        }

        // ─── 1. Apple iOS Devices (iPhone / iPad / iPod) ───────────
        if (preg_match('/iPhone/i', $userAgent)) {
            // Check if specific model signature exists or fallback to iPhone
            return self::parseIPhoneDetails($userAgent, $clientHintModel);
        }

        if (preg_match('/iPad/i', $userAgent) || (preg_match('/Macintosh/i', $userAgent) && preg_match('/Mobile/i', $userAgent))) {
            return 'Apple iPad';
        }

        // ─── 2. Android Phones & Tablets ───────────────────────────
        if (preg_match('/Android/i', $userAgent)) {
            return self::parseAndroidDetails($userAgent, $clientHintModel);
        }

        // ─── 3. Mac Desktop / Laptops ──────────────────────────────
        if (preg_match('/Macintosh|Mac OS X/i', $userAgent)) {
            $browser = self::detectBrowser($userAgent);
            return "MacBook / Mac ({$browser})";
        }

        // ─── 4. Windows PC ─────────────────────────────────────────
        if (preg_match('/Windows NT/i', $userAgent)) {
            $osVersion = 'Windows PC';
            if (preg_match('/Windows NT 10\.0/i', $userAgent)) {
                $osVersion = 'Windows 10/11 PC';
            } elseif (preg_match('/Windows NT 6\.3/i', $userAgent)) {
                $osVersion = 'Windows 8.1 PC';
            } elseif (preg_match('/Windows NT 6\.1/i', $userAgent)) {
                $osVersion = 'Windows 7 PC';
            }
            $browser = self::detectBrowser($userAgent);
            return "{$osVersion} ({$browser})";
        }

        // ─── 5. Linux / Chrome OS ──────────────────────────────────
        if (preg_match('/CrOS/i', $userAgent)) {
            return 'Google Chromebook';
        }

        if (preg_match('/Linux/i', $userAgent)) {
            $browser = self::detectBrowser($userAgent);
            return "Linux PC ({$browser})";
        }

        return 'Standard Web Browser';
    }

    /**
     * Parse iPhone details from user agent or hints.
     */
    private static function parseIPhoneDetails(string $userAgent, ?string $clientHintModel): string
    {
        if (! empty($clientHintModel) && stripos($clientHintModel, 'iPhone') !== false) {
            return $clientHintModel;
        }

        // iOS version
        $iosVer = '';
        if (preg_match('/OS (\d+_\d+)/i', $userAgent, $matches)) {
            $iosVer = ' iOS ' . str_replace('_', '.', $matches[1]);
        }

        return 'Apple iPhone' . ($iosVer ? " ({$iosVer})" : '');
    }

    /**
     * Parse Android device brand and model.
     */
    private static function parseAndroidDetails(string $userAgent, ?string $clientHintModel): string
    {
        // Check for client-provided model first
        if (! empty($clientHintModel)) {
            $mapped = self::mapAndroidModel($clientHintModel);
            if ($mapped) {
                return $mapped;
            }
            return $clientHintModel;
        }

        // Check for Android model in User-Agent, e.g. "Build/SM-G998B;" or "; SM-S918B "
        if (preg_match('/;\s*([^;]+?)\s+Build\//i', $userAgent, $matches)) {
            $rawModel = trim($matches[1]);
            $mapped = self::mapAndroidModel($rawModel);
            if ($mapped) {
                return $mapped;
            }
            return self::cleanDeviceModel($rawModel);
        }

        // Samsung generic check
        if (preg_match('/Samsung/i', $userAgent)) {
            return 'Samsung Galaxy Device';
        }

        return 'Android Mobile Device';
    }

    /**
     * Map common Android model codes to commercial names.
     */
    private static function mapAndroidModel(string $model): ?string
    {
        $model = trim($model);

        // Samsung Galaxy series
        if (preg_match('/^SM-S928/i', $model)) return 'Samsung Galaxy S24 Ultra';
        if (preg_match('/^SM-S926/i', $model)) return 'Samsung Galaxy S24+';
        if (preg_match('/^SM-S921/i', $model)) return 'Samsung Galaxy S24';
        if (preg_match('/^SM-S918/i', $model)) return 'Samsung Galaxy S23 Ultra';
        if (preg_match('/^SM-S916/i', $model)) return 'Samsung Galaxy S23+';
        if (preg_match('/^SM-S911/i', $model)) return 'Samsung Galaxy S23';
        if (preg_match('/^SM-S908/i', $model)) return 'Samsung Galaxy S22 Ultra';
        if (preg_match('/^SM-S906/i', $model)) return 'Samsung Galaxy S22+';
        if (preg_match('/^SM-S901/i', $model)) return 'Samsung Galaxy S22';
        if (preg_match('/^SM-G998/i', $model)) return 'Samsung Galaxy S21 Ultra';
        if (preg_match('/^SM-G996/i', $model)) return 'Samsung Galaxy S21+';
        if (preg_match('/^SM-G991/i', $model)) return 'Samsung Galaxy S21';
        if (preg_match('/^SM-A546/i', $model)) return 'Samsung Galaxy A54 5G';
        if (preg_match('/^SM-A536/i', $model)) return 'Samsung Galaxy A53 5G';
        if (preg_match('/^SM-A346/i', $model)) return 'Samsung Galaxy A34 5G';
        if (preg_match('/^SM-A245/i', $model)) return 'Samsung Galaxy A24';
        if (preg_match('/^SM-A145/i', $model)) return 'Samsung Galaxy A14';
        if (preg_match('/^SM-A155/i', $model)) return 'Samsung Galaxy A15';
        if (preg_match('/^SM-A256/i', $model)) return 'Samsung Galaxy A25 5G';
        if (preg_match('/^SM-A356/i', $model)) return 'Samsung Galaxy A35 5G';
        if (preg_match('/^SM-A556/i', $model)) return 'Samsung Galaxy A55 5G';
        if (preg_match('/^SM-F946/i', $model)) return 'Samsung Galaxy Z Fold 5';
        if (preg_match('/^SM-F731/i', $model)) return 'Samsung Galaxy Z Flip 5';
        if (preg_match('/^SM-N986/i', $model)) return 'Samsung Galaxy Note 20 Ultra';
        if (preg_match('/^SM-/i', $model)) return 'Samsung Galaxy (' . $model . ')';

        // Google Pixel
        if (preg_match('/Pixel 8 Pro/i', $model)) return 'Google Pixel 8 Pro';
        if (preg_match('/Pixel 8/i', $model)) return 'Google Pixel 8';
        if (preg_match('/Pixel 7 Pro/i', $model)) return 'Google Pixel 7 Pro';
        if (preg_match('/Pixel 7/i', $model)) return 'Google Pixel 7';
        if (preg_match('/Pixel 6/i', $model)) return 'Google Pixel 6';
        if (preg_match('/Pixel/i', $model)) return $model;

        // Tecno & Infinix (prevalent in Somali universities)
        if (preg_match('/TECNO|Infinix|Itel/i', $model)) {
            return self::cleanDeviceModel($model);
        }

        // Xiaomi / Redmi
        if (preg_match('/Redmi|POCO|Xiaomi|2201|2301/i', $model)) {
            return 'Xiaomi / ' . self::cleanDeviceModel($model);
        }

        return null;
    }

    /**
     * Clean and format raw device model string.
     */
    private static function cleanDeviceModel(string $model): string
    {
        $model = preg_replace('/^Android\s*/i', '', $model);
        return ucwords(trim($model));
    }

    /**
     * Detect browser name.
     */
    private static function detectBrowser(string $userAgent): string
    {
        if (preg_match('/Edg\//i', $userAgent)) return 'Microsoft Edge';
        if (preg_match('/Chrome\//i', $userAgent) && ! preg_match('/Edg\//i', $userAgent)) return 'Chrome';
        if (preg_match('/Safari\//i', $userAgent) && ! preg_match('/Chrome\//i', $userAgent)) return 'Safari';
        if (preg_match('/Firefox\//i', $userAgent)) return 'Firefox';
        if (preg_match('/OPR\//i', $userAgent)) return 'Opera';
        return 'Browser';
    }
}
