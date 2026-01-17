import { BlogImages } from '../../assets/blogImages';
import { Blog } from '../../types/types';

export const chaitraPosts: Blog[] = [
  {
    id: 'ram-navami-detail',
    eventDate: { type: 'LUNAR', month: 12, paksha: 'shukla', tithi: 9, approxBsDay: 24 },
    title: 'रामनवमी र चैते दशैं',
    excerpt: 'मर्यादा पुरुषोत्तम रामको आदर्श जीवनबाट हामीले के सिक्ने? पितृ भन्ती र भ्रातृ प्रेम।',
    content: `
            <p>चैत्र शुक्ल पक्षमा पर्ने नवरात्र (चैते दशैं) र रामनवमी शक्ति र भक्तिको पर्व हो।</p>
            <h3>रामको आदर्श</h3>
            <p>भगवान रामलाई 'मर्यादा पुरुषोत्तम' भनिन्छ किनकि उहाँले जीवनमा कहिल्यै मर्यादा नाघ्नुभएन।</p>
            <ul>
                <li><strong>पितृ आज्ञा:</strong> वचनको पक्का (रघुकुल रीत सदा चली आई, प्राण जाए पर वचन न जाई)।</li>
                <li><strong>भ्रातृ प्रेम:</strong> भरत र लक्ष्मणसँगको प्रेम।</li>
                <li><strong>सत्यता:</strong> एक पत्नी व्रत र प्रजाको हित।</li>
            </ul>
            <p>रामनवमीमा व्रत बस्नाले मनका इच्छाहरू पूरा हुने र पाप नाश हुने विश्वास छ।</p>
        `,
    image: BlogImages.ramNavami,
    tags: ['चाडपर्व', 'राम'],
    author: 'धर्म गुरु',
    date: 'चैत्र शुक्ल नवमी',
    readTime: '५ मिनेट'
  }
];
