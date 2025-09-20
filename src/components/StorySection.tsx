import React from "react";

export default function StorySection() {
  return (
    <section className="w-full py-20 px-8 lg:px-16 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground">
                Our Story
              </h2>
              <div className="w-16 h-1 bg-primary"></div>
            </div>
            
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                Founded with a vision to revolutionize eyewear, we've been crafting 
                exceptional glasses that blend style, comfort, and innovation for over 
                two decades.
              </p>
              
              <p>
                From our humble beginnings as a small optical shop to becoming a 
                trusted name in premium eyewear, our journey has been driven by 
                one simple belief: everyone deserves to see the world clearly 
                and look great doing it.
              </p>
              
              <p>
                Today, we continue to push boundaries with cutting-edge lens 
                technology, sustainable materials, and timeless designs that 
                enhance your natural beauty while protecting your vision.
              </p>
            </div>
            
            <div className="pt-4">
              <button className="bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-wide hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                Learn More About Us
              </button>
            </div>
          </div>
          
          {/* Story Stats */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">25+</div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">Years Experience</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">50K+</div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">Happy Customers</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">1000+</div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">Frame Styles</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">15</div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">Store Locations</div>
              </div>
            </div>
            
            {/* Achievement badges */}
            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-4 p-4 bg-background/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">★</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Award Winning Design</div>
                  <div className="text-sm text-foreground/70">International Eyewear Design Awards 2023</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-background/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">♻</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Eco-Friendly</div>
                  <div className="text-sm text-foreground/70">Sustainable materials & packaging</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}