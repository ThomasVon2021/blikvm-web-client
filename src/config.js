/**
 *
 * project config settings file
 *
 */
import project from '../package.json';
/**
 * Change the IP address below to your development testing machine's IP address. In the official environment, this configuration is invalid
 */
const dev_device_ip = '192.168.8.16';
const dev_device_port = 10005;

const env = process.env.NODE_ENV;

const version = project.version;
const build = project.build;

export default {
    version:version,
    build:build,
    host_ip : env === 'development' ? dev_device_ip : window.location.hostname,
    host_http_port: env === 'development' ? dev_device_port : parseInt(window.location.port)
}
