import React, { useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import Head from '@/components/Head';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Help() {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const faqRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smoothly scroll to the requested section if hash exists
    const el = hash === '#shipping' ? shippingRef.current : hash === '#faq' ? faqRef.current : null;
    if (el) {
      // small delay so layout paints first
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [hash]);

  return (
    <>
      <Head title="Customer Care — Amine Eyewear" description="Help center and shipping information for Amine Eyewear." url="https://lunette.amine.agency/help" />
      <Layout>
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold">{t('footer.customerCare', { defaultValue: 'Customer Care' })}</h1>
          <p className="text-muted-foreground mt-2">{t('common.help', { defaultValue: 'Help' })}</p>
        </div>

        {/* Shipping Information */}
        <div ref={shippingRef} id="shipping" className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('footer.shipping', { defaultValue: 'Shipping Info' })}</h2>
          <div className="rounded-xl border p-4 md:p-6 bg-card/50">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="when">
                <AccordionTrigger>
                  {t('productDetail.standardShipping', { defaultValue: 'Standard Shipping (5-7 days)' })}
                </AccordionTrigger>
                <AccordionContent>
                  {t('productDetail.shippingNote', { defaultValue: 'All orders are processed within 1-2 business days. You will receive a tracking number once your order has shipped.' })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="express">
                <AccordionTrigger>
                  {t('productDetail.expressShipping', { defaultValue: 'Express Shipping (2-3 days)' })}
                </AccordionTrigger>
                <AccordionContent>
                  {t('productDetail.shippingNote', { defaultValue: 'All orders are processed within 1-2 business days. You will receive a tracking number once your order has shipped.' })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="free">
                <AccordionTrigger>
                  {t('productDetail.freeShipping', { defaultValue: 'Free shipping' })}
                </AccordionTrigger>
                <AccordionContent>
                  {t('productDetail.ordersOver', { defaultValue: 'Orders over $100' })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* FAQ */}
        <div ref={faqRef} id="faq" className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('footer.faq', { defaultValue: 'FAQ' })}</h2>
          <div className="rounded-xl border p-4 md:p-6 bg-card/50">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="returns">
                <AccordionTrigger>{t('orders.returnInitiated', { defaultValue: 'Returns' })}</AccordionTrigger>
                <AccordionContent>
                  {t('footer.returns', { defaultValue: 'Returns' })}: {t('story.shippingNote', { defaultValue: 'Please contact support to initiate a return within 30 days.' })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment">
                <AccordionTrigger>{t('checkout.paymentMethod', { defaultValue: 'Payment Method' })}</AccordionTrigger>
                <AccordionContent>
                  {t('checkout.demoNote', { defaultValue: 'This is a demo checkout. No real payment will be processed.' })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="orders">
                <AccordionTrigger>{t('orders.orderDetails', { defaultValue: 'Order Details' })}</AccordionTrigger>
                <AccordionContent>
                  {t('orders.trackOrder', { defaultValue: 'Track Order' })}: {t('common.help', { defaultValue: 'Help' })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}


