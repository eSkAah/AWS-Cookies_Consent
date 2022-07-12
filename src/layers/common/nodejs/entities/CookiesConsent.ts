import {v4 as uuid} from "uuid"

export interface ICookiesConsent {
    id: string;
    timestamp: Date;
    anonymousIp: string;
    action: string;
    url: string;
    userAgent: string;
    bannerText: string;
    consents: {
        uncategorized: boolean;
        essential: boolean;
        personnalization: boolean;
        analytics: boolean;
        marketing: boolean;
    };
}

export class CookiesConsent implements ICookiesConsent {
    id: string;
    timestamp: Date;
    anonymousIp: string;
    action: string;
    url: string;
    userAgent: string;
    bannerText: string;
    consents: {
        uncategorized: boolean;
        essential: boolean;
        personnalization: boolean;
        analytics: boolean;
        marketing: boolean;
    };
    constructor({
        id = uuid(),
        timestamp = new Date(),
        anonymousIp = "inprogress",
        action,
        url,
        userAgent,
        bannerText,
        consents,
    }: any) {
        this.id = id;
        this.timestamp = new Date(timestamp);
        this.anonymousIp = anonymousIp;
        this.action = action;
        this.url = url;
        this.userAgent = userAgent;
        this.bannerText = bannerText;
        this.consents = consents;
    }

    type(): string {
        return "COOKIES_CONSENT";
    }

    key() {
        return {
            PK: `${this.type()}#${this.id}`,
        };
    }

    toItem() {
        return {
            ...this.key(),
            id: this.id,
            timestamp: this.timestamp.toISOString(),
            anonymousIp: this.anonymousIp,
            action: this.action,
            url: this.url,
            userAgent: this.userAgent,
            bannerText: this.bannerText,
            consents: this.consents,
        };
    }
}