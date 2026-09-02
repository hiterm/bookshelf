import dayjs from "dayjs";

export const formatLocalTimestamp = (timestamp: string): string =>
  dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");
