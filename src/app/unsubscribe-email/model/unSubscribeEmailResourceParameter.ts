import { ResourceParameter } from "@core/domain-classes/resource-parameter";

export interface UnSubscribeEmailResourceParameter extends ResourceParameter {
    email: string;
}