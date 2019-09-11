export declare type RoleType = '' | 'Admin' | 'Teacher';

export interface TokenRI {
    '@odata.context': string;
    expiration: string;
    token: string;
    tokenId: string;
}

export interface GroupRI {
    '@odata.context': string;
    '@odata.count': number;
    value: Array<IGroup>;
}

export interface IGroup {
    capacityId: string;
    id: string;
    isOnDedicatedCapacity: boolean;
    isReadOnly: boolean;
    name: string;
    tenantName?: string;
};

export interface ReportRI {
    '@odata.context': string;
    '@odata.count': number;
    value: Array<IReport>;
}

export interface IReport {
    datasetId: string;
    embedUrl: string;
    id: string;
    isOwnedByMe: boolean;
    name: string;
    reportType: string;
    webUrl: string;
};

export interface IEmbedInfo {
    group: IGroup;
    report: IReport;
    applyRLS: boolean;
    customData: string;
    role: RoleType;
}

export interface IRole {
    name: string;
    dex: RoleType;
}

export class AppData {
    countDownSeconds: number;
}

export interface AppConfigChangeItem {
    groupMappingChange: boolean;
}

export interface ReportEvent {
    name: string,
    handler: (...args: Array<any>) => void
}
