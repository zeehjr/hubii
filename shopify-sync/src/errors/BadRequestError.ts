export class BadRequestError extends Error {
  constructor({
    serviceName,
    url,
    body,
    response,
  }: {
    serviceName: string;
    url: string;
    body: any;
    response: any;
  }) {
    super(
      `Service ${serviceName} responded with BadRequest. Requested Url: ${url}. Body: ${JSON.stringify(
        body
      )}. Response: ${JSON.stringify(response?.data)}`
    );
  }
}
