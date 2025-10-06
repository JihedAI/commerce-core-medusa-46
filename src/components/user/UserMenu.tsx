import { Link } from 'react-router-dom';
import {
  User,
  LogOut,
  Package,
  Heart,
  Settings,
  ShoppingBag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const { customer: user, logout } = useAuth();

  if (!user) {
    return (
      <Link to="/login">
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback>
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/profile">
          <DropdownMenuItem>
            <Package className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/checkout">
          <DropdownMenuItem>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Checkout</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}