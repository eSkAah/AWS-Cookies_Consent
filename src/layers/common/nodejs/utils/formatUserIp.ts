export const formatUserIp = (ip: string): string => {
    let tmpUserIp = ip.split(".");
    tmpUserIp.splice(3,1,"1111");
    return tmpUserIp.join(".");
}