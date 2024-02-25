import type { Writable } from 'stream';
import type { APIGatewayProxyEventV2, Context, Handler } from 'aws-lambda';
// https://repost.aws/questions/QU9MFuTQKOR_WBo-klcQNa7Q/how-do-i-change-status-and-headers-when-streaming-with-lambda-and-function-url
declare global {
    namespace awslambda {
        // export function streamifyResponse(
        //     f: (event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream, context: Context) => Promise<void>,
        // ): Handler;
        export namespace HttpResponseStream {
            function from(writable: Writable, metadata: any): Writable;
        }
        export function streamifyResponse(handler: StreamifyHandler): Handler<APIGatewayProxyEventV2>;
        // export type ResponseStream = Writable & {
        //     setContentType(type: string): void;
        // };
        export type StreamifyHandler = (
            event: APIGatewayProxyEventV2,
            responseStream: ResponseStream,
            context: Context,
        ) => Promise<any>;
    }
}
