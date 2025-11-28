import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';
import logger from './log';

// Compose Octokit with desired plugins
const MyOctokit = Octokit.plugin(throttling, retry);

/**
 * Creates and configures an Octokit client instance with throttling and retry plugins
 * @param token - GitHub personal access token
 * @returns Configured Octokit instance
 */
export function createOctokitClient(token: string) {
    return new MyOctokit({
        auth: token,
        throttle: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onRateLimit: (retryAfter: number, options: any) => {
                logger.warn(
                    `Request quota exhausted for request ${options.method} ${options.url}`
                );
                if (options.request.retryCount === 0) {
                    logger.debug(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSecondaryRateLimit: (retryAfter: number, options: any) => {
                logger.warn(
                    `SecondaryRateLimit detected for request ${options.method} ${options.url}`
                );
            },
        },
    });
}
