/**
 *
 * project config settings file
 *
 */

/**
 * 修改下方的IP为你的开发测试机ip，正式环境，此配置无效
 */
const dev_device_ip = '110.40.128.155';

const env = process.env.NODE_ENV;
import project from '../package.json';

const version = project.version;
const build = project.build;

export default {
    version:version,
    build:build,
    host_ip : env === 'development' ? dev_device_ip : window.location.hostname,
    host_http_port: 10005
}
