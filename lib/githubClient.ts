import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

// Compose Octokit with desired plugins
const MyOctokit = Octokit.plugin(throttling, retry);

interface ThrottleOptions {
    method: string;
    url: string;
    request: {
        retryCount: number;
    };
    doNotRetry: ['429'],
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 10000,
}
