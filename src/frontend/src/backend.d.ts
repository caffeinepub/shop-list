import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductLibrary {
    id: bigint;
    ownerId: Principal;
    name: string;
    shop: string;
    type: string;
    description: string;
    image: string;
    price: bigint;
}
export interface Product {
    id: bigint;
    status: string;
    link: string;
    name: string;
    shop: string;
    availability: string;
    projectId: bigint;
    quantity: bigint;
    image: string;
    roomId: bigint;
    price: bigint;
}
export interface Material {
    id: bigint;
    name: string;
    description: string;
    image: string;
    price: bigint;
    format: string;
}
export interface AllUserData {
    tasks: Array<Task>;
    projects: Array<Project>;
    productLibrary: Array<ProductLibrary>;
    userProfile: UserProfile;
    moodboards: Array<Moodboard>;
    shoppingLists: Array<ShoppingList>;
}
export interface Moodboard {
    id: bigint;
    name: string;
    totalCost: bigint;
    description: string;
    projectId: bigint;
    roomId: bigint;
    products: Array<string>;
    images: Array<string>;
}
export interface Document {
    id: bigint;
    file: string;
    name: string;
    fileSize: bigint;
    projectId: bigint;
    docType: string;
    format: string;
}
export interface Task {
    id: bigint;
    status: string;
    assigned: string;
    title: string;
    ownerId: Principal;
    type: string;
    description: string;
    deadline: string;
    projectId: bigint;
    roomId: bigint;
}
export interface ShoppingList {
    id: bigint;
    status: string;
    total: bigint;
    ownerId: Principal;
    name: string;
    shop: string;
    discount: bigint;
    products: Array<Product>;
}
export interface Room {
    id: bigint;
    area: bigint;
    name: string;
    notes: string;
    category: string;
    products: Array<Product>;
    budget: bigint;
}
export interface Project {
    id: bigint;
    status: string;
    clientId: bigint;
    ownerId: Principal;
    name: string;
    sharedWithClients: Array<Principal>;
    budget: bigint;
    rooms: Array<Room>;
    timeline: string;
}
export interface UserProfile {
    id: bigint;
    name: string;
    role: Role;
    email: string;
    company: string;
    phone: string;
}
export enum Role {
    client = "client",
    manager = "manager",
    admin = "admin",
    designer = "designer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMaterial(id: bigint, name: string, description: string, image: string, format: string, price: bigint): Promise<void>;
    addProject(id: bigint, name: string, clientId: bigint, timeline: string, budget: bigint, status: string, rooms: Array<Room>): Promise<void>;
    addRoom(projectId: bigint, id: bigint, name: string, area: bigint, notes: string, category: string, budget: bigint, products: Array<Product>): Promise<void>;
    addShoppingList(id: bigint, name: string, total: bigint, discount: bigint, shop: string, products: Array<Product>, status: string): Promise<void>;
    addTask(id: bigint, title: string, description: string, status: string, deadline: string, projectId: bigint, roomId: bigint, type: string, assigned: string): Promise<void>;
    addToProductLibrary(id: bigint, name: string, image: string, price: bigint, shop: string, description: string, type: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllTasks(projectId: bigint): Promise<Array<Task>>;
    getAllUserData(): Promise<AllUserData>;
    getAllUsersData(): Promise<Array<AllUserData>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocuments(projectId: bigint): Promise<Array<Document>>;
    getMaterialsByIds(ids: Array<bigint>): Promise<Array<Material>>;
    getMyProjects(): Promise<Array<Project>>;
    getProductLibrary(): Promise<Array<ProductLibrary>>;
    getProject(id: bigint): Promise<Project | null>;
    getShoppingLists(): Promise<Array<ShoppingList>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    shareProjectWithClient(projectId: bigint, clientPrincipal: Principal): Promise<void>;
    updateDocument(id: bigint, name: string, format: string, fileSize: bigint, file: string, projectId: bigint, docType: string): Promise<void>;
    updateUser(id: bigint, name: string, email: string, phone: string, company: string, role: Role): Promise<void>;
}
