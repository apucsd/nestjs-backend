import { Role } from 'src/common/enum/role.enum';
import { JwtPayload } from '../guards/auth/auth.guard';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role?: Role | Role[];
  iat?: number;
  exp?: number;
}
