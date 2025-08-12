function normalize(paymentPointer: string) {
    if (!paymentPointer.startsWith('$')) {
        return paymentPointer;
    }

    const withoutDollar = paymentPointer.slice(1);
    return `https://${withoutDollar}`;
}

export async function get(paymentPointer: string) {
    const endpoint = normalize(paymentPointer);
    console.log('ENDPOINT: ', endpoint)
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
        throw new Error('Failed to resolve Payment Pointer');
    }

    return res.json();
}