import { apiPlugin, storyblokInit } from '@storyblok/js';
import 'dotenv/config';

const { storyblokApi } = storyblokInit({
  accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
  apiOptions: {
    region: process.env.STORYBLOK_REGION || 'eu',
  },
  use: [apiPlugin],
});

export default storyblokApi;
