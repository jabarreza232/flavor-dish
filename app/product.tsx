 export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
}
export const ALL_PRODUCTS: Product[] = [
                {
                    id: '1',
                    name: 'Rendang Sapi Premium',
                    description: 'Daging empuk bumbu rempah melimpah.',
                    price: 45000,
                    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400',
                    rating: 4.8,
                },
                {
                    id: '2',
                    name: 'Soto Ayam Kuning',
                    description: 'Segar dengan koya dan ayam kampung.',
                    price: 35000,
                    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=400',
                    rating: 4.5,
                },
                {
                    id: '3',
                    name: 'Salad Sayur Organik',
                    description: 'Sayuran hidroponik & saus wijen.',
                    price: 28000,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400',
                    rating: 4.7,
                },
                {
                    id: '4',
                    name: 'Nasi Goreng Spesial',
                    description: 'Dilengkapi telur mata sapi dan sate.',
                    price: 32000,
                    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400',
                    rating: 4.9,
                }
            ];
