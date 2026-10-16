/**
 * Device Detector Utility for Single-Device Enforcement
 * Generates/persists unique device token and identifies accurate device models.
 */

export function getOrCreateDeviceToken() {
    let token = localStorage.getItem('portal_device_token');
    if (!token) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            token = crypto.randomUUID();
        } else {
            token = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
        }
        localStorage.setItem('portal_device_token', token);
    }
    return token;
}

export async function detectDeviceName() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const screenWidth = window.screen.width || 0;
    const screenHeight = window.screen.height || 0;
    const ratio = window.devicePixelRatio || 1;
    const maxDim = Math.max(screenWidth, screenHeight);
    const minDim = Math.min(screenWidth, screenHeight);

    // 1. Try High Entropy Client Hints (Android Chrome, modern browsers)
    if (navigator.userAgentData?.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
            if (hints.model) {
                const mapped = mapKnownAndroidModel(hints.model);
                if (mapped) return mapped;
                return hints.model;
            }
        } catch (e) {
            // fallback
        }
    }

    // 2. iOS Devices (iPhone / iPad)
    if (/iPhone/i.test(ua)) {
        return detectIPhoneModel(minDim, maxDim, ratio);
    }

    if (/iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'Apple iPad';
    }

    // 3. Android User-Agent parsing
    if (/Android/i.test(ua)) {
        const match = ua.match(/;\s*([^;]+?)\s+Build\//i);
        if (match && match[1]) {
            const mapped = mapKnownAndroidModel(match[1]);
            if (mapped) return mapped;
            return cleanModelName(match[1]);
        }
        if (/Samsung/i.test(ua)) return 'Samsung Galaxy Phone';
        return 'Android Mobile Device';
    }

    // 4. macOS
    if (/Macintosh|Mac OS X/i.test(ua)) {
        const browser = getBrowserName(ua);
        return `MacBook / Mac (${browser})`;
    }

    // 5. Windows
    if (/Windows NT/i.test(ua)) {
        const browser = getBrowserName(ua);
        if (/Windows NT 10\.0/i.test(ua)) return `Windows 10/11 PC (${browser})`;
        return `Windows PC (${browser})`;
    }

    // 6. Linux
    if (/Linux/i.test(ua)) {
        const browser = getBrowserName(ua);
        return `Linux PC (${browser})`;
    }

    return 'Personal Computer / Web Browser';
}

function detectIPhoneModel(minDim, maxDim, ratio) {
    if (minDim === 430 && maxDim === 932) return 'iPhone 14 Pro Max / 15 Plus / 15 Pro Max';
    if (minDim === 393 && maxDim === 852) return 'iPhone 14 Pro / 15 / 15 Pro';
    if (minDim === 428 && maxDim === 926) return 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max';
    if (minDim === 390 && maxDim === 844) return 'iPhone 14 / 13 / 13 Pro / 12';
    if (minDim === 414 && maxDim === 896 && ratio >= 3) return 'iPhone 11 Pro Max / XS Max';
    if (minDim === 414 && maxDim === 896 && ratio < 3) return 'iPhone 11 / XR';
    if (minDim === 375 && maxDim === 812) return 'iPhone 11 Pro / XS / X / 13 mini';
    if (minDim === 414 && maxDim === 736) return 'iPhone 8 Plus / 7 Plus';
    if (minDim === 375 && maxDim === 667) return 'iPhone SE / iPhone 8';
    return 'Apple iPhone';
}

function mapKnownAndroidModel(model) {
    const m = model.trim();
    if (/^SM-S928/i.test(m)) return 'Samsung Galaxy S24 Ultra';
    if (/^SM-S926/i.test(m)) return 'Samsung Galaxy S24+';
    if (/^SM-S921/i.test(m)) return 'Samsung Galaxy S24';
    if (/^SM-S918/i.test(m)) return 'Samsung Galaxy S23 Ultra';
    if (/^SM-S916/i.test(m)) return 'Samsung Galaxy S23+';
    if (/^SM-S911/i.test(m)) return 'Samsung Galaxy S23';
    if (/^SM-S908/i.test(m)) return 'Samsung Galaxy S22 Ultra';
    if (/^SM-S906/i.test(m)) return 'Samsung Galaxy S22+';
    if (/^SM-S901/i.test(m)) return 'Samsung Galaxy S22';
    if (/^SM-G998/i.test(m)) return 'Samsung Galaxy S21 Ultra';
    if (/^SM-G996/i.test(m)) return 'Samsung Galaxy S21+';
    if (/^SM-G991/i.test(m)) return 'Samsung Galaxy S21';
    if (/^SM-A546/i.test(m)) return 'Samsung Galaxy A54 5G';
    if (/^SM-A536/i.test(m)) return 'Samsung Galaxy A53 5G';
    if (/^SM-A346/i.test(m)) return 'Samsung Galaxy A34 5G';
    if (/^SM-A245/i.test(m)) return 'Samsung Galaxy A24';
    if (/^SM-A145/i.test(m)) return 'Samsung Galaxy A14';
    if (/^SM-A155/i.test(m)) return 'Samsung Galaxy A15';
    if (/^SM-A256/i.test(m)) return 'Samsung Galaxy A25 5G';
    if (/^SM-A356/i.test(m)) return 'Samsung Galaxy A35 5G';
    if (/^SM-A556/i.test(m)) return 'Samsung Galaxy A55 5G';
    if (/^SM-F946/i.test(m)) return 'Samsung Galaxy Z Fold 5';
    if (/^SM-F731/i.test(m)) return 'Samsung Galaxy Z Flip 5';
    if (/^SM-N986/i.test(m)) return 'Samsung Galaxy Note 20 Ultra';
    if (/^SM-/i.test(m)) return 'Samsung Galaxy (' + m + ')';
    if (/Pixel 8 Pro/i.test(m)) return 'Google Pixel 8 Pro';
    if (/Pixel 8/i.test(m)) return 'Google Pixel 8';
    if (/Pixel 7 Pro/i.test(m)) return 'Google Pixel 7 Pro';
    if (/Pixel 7/i.test(m)) return 'Google Pixel 7';
    if (/Pixel 6/i.test(m)) return 'Google Pixel 6';
    if (/TECNO|Infinix|Itel/i.test(m)) return m;
    if (/Redmi|POCO|Xiaomi/i.test(m)) return 'Xiaomi / ' + m;
    return null;
}

function cleanModelName(model) {
    return model.replace(/^Android\s*/i, '').trim();
}

function getBrowserName(ua) {
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    return 'Browser';
}
