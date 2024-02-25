import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import fs from 'fs';
// https://plainenglish.io/blog/file-upload-to-amazon-s3-using-node-js-42757c6a39e9
// 설정 안하고 하면,  a non-empty Access Key (AKID) must be provided in the credential 오류가 발생함
const awsAccessKey = process.env.MY_AWS_ACCESS_KEY || '';
const awsSecretKey = process.env.MY_AWS_SECRET_KEY || '';
// s3 클라이언트 연결
const s3 = new S3Client({
    credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
    region: 'ap-northeast-1',
});
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
    // if (!event.file) {
    //     return 'Parameter "file" is missing.';
    // } else if (!event.type) {
    //     return 'Parameter "type" is missing.';
    // }

    const responseObject = uploadFile(event.body, 'test.png', 'images/png');

    responseStream.setContentType('images/');
    responseStream = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata);
    console.log('event : ');
    console.log(event);
    console.log(event.headers.mimetype);
    responseStream.write('DONE!');
    responseStream.write(responseObject);
    return responseStream.end();
    // await pipeline(requestStream, responseStream);
});

// https://songsong.dev/entry/S3%EC%97%90-%ED%8C%8C%EC%9D%BC%EC%9D%84-%EC%97%85%EB%A1%9C%EB%93%9C%ED%95%98%EB%8A%94-%EC%84%B8-%EA%B0%80%EC%A7%80-%EB%B0%A9%EB%B2%95
async function uploadFile(fileBuffer: any, fileName: string, mimetype: any) {
    const uploadParams = {
        Bucket: 's3-lswn-streaming-test-bucket',
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
    };
    // fs.createReadStream(fileBuffer);
    const res = await s3.send(new PutObjectCommand(uploadParams));
    return res.$metadata.httpStatusCode;
}
