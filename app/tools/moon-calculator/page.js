import { getData } from '@/utils/getData';

export default async function Page() {
    const { data } = await getData();
    // ... rest of your code using data.memecoins
} 