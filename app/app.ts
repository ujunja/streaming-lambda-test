// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as aws from 'aws-sdk';
import fs from 'fs';
import util from 'util';
import stream, { Readable } from 'stream';
import { writeFile } from 'fs/promises';
const pipeline = util.promisify(stream.pipeline);
// https://plainenglish.io/blog/file-upload-to-amazon-s3-using-node-js-42757c6a39e9
// 설정 안하고 하면,  a non-empty Access Key (AKID) must be provided in the credential 오류가 발생함
const awsAccessKey = process.env.MY_AWS_ACCESS_KEY || '';
const awsSecretKey = process.env.MY_AWS_SECRET_KEY || '';
const awsBucketName = process.env.MY_BUCKET_NAME || '';
// s3 클라이언트 연결
// const s3 = new S3Client({
//     credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
//     region: 'ap-northeast-1',
// });
// FilePath
const filePath = '/tmp/image.png';

const s3 = new aws.S3({ region: 'ap-northeast-1' });

exports.handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
    const httpResponseMetadata = {
        statusCode: 200,
        headers: {
            // 'Content-Type': 'audio/',
            'Content-Type': 'images/',
            'X-Custom-Header': 'Example-Custom-Header',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
        },
    };
    const response = {
        isBase64Encoded: false,
        statusCode: 200,
    };
    // if (!event.file) {
    //     return 'Parameter "file" is missing.';
    // } else if (!event.type) {
    //     return 'Parameter "type" is missing.';
    // }

    // const responseObject = uploadFile(event.body, 'test.png', 'images/png');
    const getObject = await s3.getObject({ Bucket: awsBucketName, Key: 'test.png' }).promise();
    // const getObject = await s3.send(new GetObjectCommand(params));
    fs.writeFileSync(filePath, getObject.Body as Buffer);

    // if (getObject.Body instanceof Readable) {
    //     responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata);
    //     await pipeline(getObject.Body, responseStream);
    // }
    const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
    // responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata);
    const writeStream = fs.createWriteStream('/tmp/write.png');
    readStream.pipe(writeStream);
    readStream.on('data', (chunk) => {
        console.log('chunk: ');
        console.log(chunk);
        // pipeline(chunk, responseStream);
    });
    readStream.on('end', () => {
        console.log('the end');
        return response;
    });
    // success
    // responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata);
    // const readStream = s3.getObject({ Bucket: awsBucketName, Key: 'test.png' }).createReadStream();
    // await pipeline(readStream, responseStream);
});

// https://songsong.dev/entry/S3%EC%97%90-%ED%8C%8C%EC%9D%BC%EC%9D%84-%EC%97%85%EB%A1%9C%EB%93%9C%ED%95%98%EB%8A%94-%EC%84%B8-%EA%B0%80%EC%A7%80-%EB%B0%A9%EB%B2%95
// async function uploadFile(fileBuffer: any, fileName: string, mimetype: any) {
//     const uploadParams = {
//         Bucket: awsBucketName,
//         Key: fileName,
//         Body: fileBuffer,
//         ContentType: mimetype,
//     };
//     // fs.createReadStream(fileBuffer);
//     const res = await s3.send(new PutObjectCommand(uploadParams));
//     return res.$metadata.httpStatusCode;
// }

// async function downloadFile(fileName: string) {
//     const res = await s3.getObject({
//         Bucket: awsBucketName,
//         Key: fileName,
//     });
//     return res;
// }
