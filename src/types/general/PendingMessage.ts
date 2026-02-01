export type PendingMessage = {
  payload: any;
  expectAck: boolean;
  retriesLeft: number;
};
