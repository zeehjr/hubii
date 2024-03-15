export class ServiceUnavailableError extends Error {
  serviceName: string;
  serviceUrl: string;

  constructor(serviceName: string, serviceUrl: string) {
    super(
      `Service ${serviceName} seems to be unavailable. Make sure it is accessible through ${serviceUrl}.`
    );

    this.serviceName = serviceName;
    this.serviceUrl = serviceUrl;
  }
}
