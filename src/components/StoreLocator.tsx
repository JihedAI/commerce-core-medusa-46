import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const StoreLocator = () => {
  const { t } = useTranslation();

  const handleDirectionsClick = () => {
    // Open specific Google Maps location for Bizerte
    window.open('https://maps.app.goo.gl/VaXcdnxLR8gaMamB6', '_blank');
  };

  const handleCallClick = () => {
    window.open('tel:+21620313348');
  };

  const handleEmailClick = () => {
    window.open('mailto:saassouguimedamine@gmail.com');
  };

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('store.title', { defaultValue: 'Visit Us in Bizerte' })}
          </h2>
          <div className="w-24 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('store.subtitle', { defaultValue: 'Discover our premium eyewear collection in the heart of Bizerte, Tunisia' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Location Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Embedded Google Maps */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.1234567890!2d9.8734!3d37.2744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDE2JzI3LjgiTiA5wrA1Mic0NC4yIkU!5e0!3m2!1sen!2stn!4v1234567890123!5m2!1sen!2stn"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[400px]"
                title="Amine Eyewear Location in Bizerte, Tunisia"
              ></iframe>
              
              {/* Location Badge */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Bizerte, Tunisia</span>
              </div>
              
              {/* Map Overlay for better UX */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Location Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Store Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  {t('store.name', { defaultValue: 'Amine Eyewear' })}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {t('store.description', { defaultValue: 'Premium eyewear boutique offering the finest selection of glasses and sunglasses in Bizerte.' })}
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {t('store.address', { defaultValue: 'City Center, Bizerte' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('store.addressDetail', { defaultValue: 'Tunisia, North Africa' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+216 20 313 348</p>
                    <p className="text-sm text-muted-foreground">
                      {t('store.phoneNote', { defaultValue: 'Call us for appointments' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">saassouguimedamine@gmail.com</p>
                    <p className="text-sm text-muted-foreground">
                      {t('store.emailNote', { defaultValue: 'Send us your inquiries' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {t('store.hours', { defaultValue: 'Mon - Sat: 9:00 AM - 7:00 PM' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('store.sunday', { defaultValue: 'Sunday: 10:00 AM - 5:00 PM' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleDirectionsClick}
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <Navigation className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                {t('store.getDirections', { defaultValue: 'Get Directions' })}
              </Button>
              
              <Button
                onClick={handleCallClick}
                variant="outline"
                size="lg"
                className="group border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('store.callNow', { defaultValue: 'Call Now' })}
              </Button>
            </div>
            
            <div className="pt-2">
              <Button
                onClick={handleDirectionsClick}
                variant="ghost"
                size="sm"
                className="group text-primary hover:text-primary/80 transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('store.viewLargerMap', { defaultValue: 'View Larger Map' })}
              </Button>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleEmailClick}
                variant="ghost"
                size="lg"
                className="group text-primary hover:text-primary/80 transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('store.sendEmail', { defaultValue: 'Send Email' })}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h4 className="text-xl font-semibold text-foreground mb-4">
              {t('store.visitTitle', { defaultValue: 'Why Visit Our Bizerte Store?' })}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <h5 className="font-semibold text-foreground mb-2">
                  {t('store.expertise', { defaultValue: 'Expert Fitting' })}
                </h5>
                <p>{t('store.expertiseDesc', { defaultValue: 'Professional eye exams and personalized frame fitting' })}</p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2">
                  {t('store.premium', { defaultValue: 'Premium Collection' })}
                </h5>
                <p>{t('store.premiumDesc', { defaultValue: 'Exclusive eyewear brands and latest fashion trends' })}</p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2">
                  {t('store.service', { defaultValue: 'Personalized Service' })}
                </h5>
                <p>{t('store.serviceDesc', { defaultValue: 'Dedicated customer care and after-sales support' })}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StoreLocator;