import axios from "axios";
import { UserDevice, UserIPTracking } from "@prisma/client";

import prisma from "../configs/prisma";

import { TDeviceInfo, TIPLocationResponse } from "../types/tracking";
import Logger from "../configs/logger";
import { isLive } from "../utils/environment";

class TrackingService {
    public static logIPInfo = async (
        ipAddress: string,
        userId: string
    ): Promise<UserIPTracking | null> => {
        try {
            Logger.debug("TrackingService: LogIPInfo: Entered");

            Logger.debug(
                "TrackingService: LogIPInfo: Making request to ip-api"
            );
            const { data: ipDetails }: { data: TIPLocationResponse } =
                await axios.get(
                    `http://ip-api.com/json/${
                        isLive() ? ipAddress : "google.com"
                    }?fields=continent,country,regionName,city,lat,lon,timezone`
                );

            if (ipDetails) {
                Logger.debug(
                    "TrackingService: LogIPInfo: Checking if ip exists"
                );
                const existingIp = await prisma.userIPTracking.findFirst({
                    where: {
                        ip: ipAddress,
                        userId,
                    },
                });

                if (existingIp) {
                    Logger.debug("TrackingService: LogIPInfo: Exists");
                    return null;
                }

                Logger.debug("TrackingService: LogIPInfo: Create save object");
                const objForSave = {
                    ...ipDetails,
                    region: ipDetails.regionName,
                    ip: ipAddress,
                    userId,
                };

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                delete objForSave.regionName;

                Logger.debug("TrackingService: LogIPInfo: Saving");
                const userIpTracking = await prisma.userIPTracking.create({
                    data: {
                        ...objForSave,
                    },
                });

                Logger.debug("TrackingService: LogIPInfo: Returning");
                return userIpTracking;
            }

            return null;
        } catch (error: any) {
            Logger.debug(
                "TrackingService: LogDeviceInfo: Error logging IP Info"
            );
            throw new Error(error);
        }
    };

    public static logDeviceInfo = async (
        deviceInfo: TDeviceInfo,
        userId: string
    ): Promise<UserDevice | null> => {
        try {
            Logger.debug("TrackingService: LogDeviceInfo: Entered");

            Logger.debug(
                "TrackingService: LogDeviceInfo: Checking device exists"
            );
            const existingDevice = await prisma.userDevice.findFirst({
                where: {
                    ...deviceInfo,
                    userId,
                },
            });

            if (existingDevice) {
                Logger.debug("TrackingService: LogDeviceInfo: Exists");
                return null;
            }

            Logger.debug("TrackingService: LogDeviceInfo: Saving");
            const userDeviceInfo = await prisma.userDevice.create({
                data: {
                    ...deviceInfo,
                    userId,
                },
            });

            Logger.debug("TrackingService: LogDeviceInfo: Returning");
            return userDeviceInfo;
        } catch (error: any) {
            Logger.debug(
                "TrackingService: LogDeviceInfo: Error logging device info"
            );
            throw new Error(error);
        }
    };
}

export default TrackingService;
