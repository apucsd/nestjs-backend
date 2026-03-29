import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest<Request>();
        const user = req.user;

        if (!user) return false;

        const userRoles: UserRole[] = Array.isArray(user.role)
            ? user.role
            : user.role
              ? [user.role]
              : [];
        return requiredRoles.some((requiredRole) =>
            userRoles.includes(requiredRole),
        );
    }
}
