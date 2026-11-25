import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Store, Users, MapPin, Clock, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Campus Delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Campus Food & Logistics,
          <br />
          <span className="text-primary">Delivered Fast</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Order from campus canteens and restaurants, get packages delivered across hostels and faculties — all optimized for university life.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Order Food Now
            </Button>
          </Link>
          <Link href="/register?role=vendor">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Become a Vendor
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Built for Campus Life</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Clock className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Average delivery under 25 minutes. Zone-based routing keeps everything close.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Campus Zones</CardTitle>
              <CardDescription>
                Smart delivery zones for hostels, faculties, and lecture complexes.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Trusted Community</CardTitle>
              <CardDescription>
                Verified student riders and campus vendors. Login with your student ID.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">One Platform, Multiple Roles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Students & Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Browse menus, place orders, track delivery in real-time, and rate your experience.
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full">Join as Customer</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Store className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Campus Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your menu, receive orders, track performance, and grow your campus business.
                </p>
                <Link href="/register?role=vendor">
                  <Button variant="outline" className="w-full">Join as Vendor</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Bike className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Student Riders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Flexible hours, campus-only deliveries, and competitive earnings between classes.
                </p>
                <Link href="/register?role=rider">
                  <Button variant="outline" className="w-full">Join as Rider</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Campus Delivery. Built for university communities.</p>
        </div>
      </footer>
    </div>
  );
}
