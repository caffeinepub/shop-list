import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Role {
    public type Role = {
      #admin;
      #manager;
      #designer;
      #client;
    };
  };

  type UserProfile = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    company : Text;
    role : Role.Role;
  };

  module UserProfile {
    public func compareById(a : UserProfile, b : UserProfile) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Project = {
    id : Nat;
    name : Text;
    clientId : Nat;
    timeline : Text;
    budget : Nat;
    status : Text;
    rooms : [Room];
    ownerId : Principal; // Designer/manager who owns this project
    sharedWithClients : [Principal]; // Clients who have access
  };

  module Project {
    public func compareById(a : Project, b : Project) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Room = {
    id : Nat;
    name : Text;
    area : Nat;
    notes : Text;
    category : Text;
    budget : Nat;
    products : [Product];
  };

  module Room {
    public func compareById(a : Room, b : Room) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Product = {
    id : Nat;
    name : Text;
    image : Text;
    price : Nat;
    shop : Text;
    link : Text;
    availability : Text;
    roomId : Nat;
    projectId : Nat;
    status : Text;
    quantity : Nat;
  };

  module Product {
    public func compareById(a : Product, b : Product) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    status : Text;
    deadline : Text;
    projectId : Nat;
    roomId : Nat;
    ownerId : Principal; // Changed to Principal for proper ownership
    type_ : Text;
    assigned : Text;
  };

  module Task {
    public func compareById(a : Task, b : Task) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Moodboard = {
    id : Nat;
    name : Text;
    description : Text;
    images : [Text];
    projectId : Nat;
    roomId : Nat;
    products : [Text];
    totalCost : Nat;
  };

  module Moodboard {
    public func compareById(a : Moodboard, b : Moodboard) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Document = {
    id : Nat;
    name : Text;
    format : Text;
    fileSize : Nat;
    file : Text;
    projectId : Nat;
    docType : Text;
  };

  module Document {
    public func compareById(a : Document, b : Document) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type ShoppingList = {
    id : Nat;
    name : Text;
    total : Nat;
    discount : Nat;
    shop : Text;
    products : [Product];
    status : Text;
    ownerId : Principal; // Owner of the shopping list
  };

  module ShoppingList {
    public func compareById(a : ShoppingList, b : ShoppingList) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type ProductLibrary = {
    id : Nat;
    name : Text;
    image : Text;
    price : Nat;
    shop : Text;
    description : Text;
    type_ : Text;
    ownerId : Principal; // Owner of the library item
  };

  module ProductLibrary {
    public func compareById(a : ProductLibrary, b : ProductLibrary) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Material = {
    id : Nat;
    name : Text;
    description : Text;
    image : Text;
    format : Text;
    price : Nat;
  };

  module Material {
    public func compareById(a : Material, b : Material) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type AllUserData = {
    userProfile : UserProfile;
    projects : [Project];
    tasks : [Task];
    moodboards : [Moodboard];
    shoppingLists : [ShoppingList];
    productLibrary : [ProductLibrary];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let projectList = List.empty<Project>();
  let taskList = List.empty<Task>();
  let moodboardList = List.empty<Moodboard>();
  let documentList = List.empty<Document>();
  let shoppingListList = List.empty<ShoppingList>();
  let productLibraryList = List.empty<ProductLibrary>();
  let materialList = List.empty<Material>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func ensureAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func ensureUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func getUserRole(caller : Principal) : ?Role.Role {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.role };
    };
  };

  func isDesignerOrManager(caller : Principal) : Bool {
    switch (getUserRole(caller)) {
      case (?#designer) { true };
      case (?#manager) { true };
      case (?#admin) { true };
      case (_) { false };
    };
  };

  func isClient(caller : Principal) : Bool {
    switch (getUserRole(caller)) {
      case (?#client) { true };
      case (_) { false };
    };
  };

  func canAccessProject(caller : Principal, project : Project) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    if (project.ownerId == caller) {
      return true;
    };

    if (project.sharedWithClients.find<Principal>(func(p) { p == caller }) != null) {
      return true;
    };

    false;
  };

  func canModifyProject(caller : Principal, project : Project) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    if (project.ownerId == caller and isDesignerOrManager(caller)) {
      return true;
    };

    false;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUser(id : Nat, name : Text, email : Text, phone : Text, company : Text, role : Role.Role) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (userProfiles.containsKey(caller)) {
      let updatedProfile : UserProfile = {
        id;
        name;
        email;
        phone;
        company;
        role;
      };
      userProfiles.add(caller, updatedProfile);
    } else {
      Runtime.trap("User profile not found");
    };
  };

  public shared ({ caller }) func addProject(id : Nat, name : Text, clientId : Nat, timeline : Text, budget : Nat, status : Text, rooms : [Room]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (not isDesignerOrManager(caller)) {
      Runtime.trap("Unauthorized: Only designers and managers can create projects");
    };

    let newProject = {
      id;
      name;
      clientId;
      timeline;
      budget;
      status;
      rooms;
      ownerId = caller;
      sharedWithClients = [];
    };
    projectList.add(newProject);
  };

  public query ({ caller }) func getProject(id : Nat) : async ?Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == id })) {
      case (null) { null };
      case (?project) {
        if (not canAccessProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have access to this project");
        };
        ?project;
      };
    };
  };

  public query ({ caller }) func getMyProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let myProjects = projectList.filter(func(project) {
      canAccessProject(caller, project);
    }).toArray().sort(Project.compareById);

    myProjects;
  };

  public shared ({ caller }) func shareProjectWithClient(projectId : Nat, clientPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canModifyProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have permission to share this project");
        };

        switch (userProfiles.get(clientPrincipal)) {
          case (null) { Runtime.trap("Client user not found") };
          case (?clientProfile) {
            if (clientProfile.role != #client) {
              Runtime.trap("Target user is not a client");
            };
          };
        };

        let alreadyShared = project.sharedWithClients.find(func(p) { p == clientPrincipal });
        if (alreadyShared == null) {
          let updatedSharedClients = project.sharedWithClients.concat([clientPrincipal]);
          let updatedProject = {
            id = project.id;
            name = project.name;
            clientId = project.clientId;
            timeline = project.timeline;
            budget = project.budget;
            status = project.status;
            rooms = project.rooms;
            ownerId = project.ownerId;
            sharedWithClients = updatedSharedClients;
          };

          updateProjectInList(projectId, updatedProject);
        };
      };
    };
  };

  func updateProjectInList(projectId : Nat, updatedProject : Project) {
    let newProjectList = List.empty<Project>();
    for (existingProject in projectList.values()) {
      if (existingProject.id == projectId) {
        newProjectList.add(updatedProject);
      } else {
        newProjectList.add(existingProject);
      };
    };
    projectList.clear();
    for (proj in newProjectList.values()) {
      projectList.add(proj);
    };
  };

  public shared ({ caller }) func addTask(id : Nat, title : Text, description : Text, status : Text, deadline : Text, projectId : Nat, roomId : Nat, type_ : Text, assigned : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canModifyProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have permission to add tasks to this project");
        };
      };
    };

    let newTask = {
      id;
      title;
      description;
      status;
      deadline;
      projectId;
      roomId;
      ownerId = caller;
      type_;
      assigned;
    };
    taskList.add(newTask);
  };

  public query ({ caller }) func getAllTasks(projectId : Nat) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canAccessProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have access to this project");
        };
      };
    };

    let filteredTasks = taskList.filter(func(task) { task.projectId == projectId }).toArray().sort(Task.compareById);
    filteredTasks;
  };

  public shared ({ caller }) func addShoppingList(id : Nat, name : Text, total : Nat, discount : Nat, shop : Text, products : [Product], status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (not isDesignerOrManager(caller)) {
      Runtime.trap("Unauthorized: Only designers and managers can create shopping lists");
    };

    let newShoppingList = {
      id;
      name;
      total;
      discount;
      shop;
      products;
      status;
      ownerId = caller;
    };
    shoppingListList.add(newShoppingList);
  };

  public query ({ caller }) func getShoppingLists() : async [ShoppingList] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let filteredLists = if (AccessControl.isAdmin(accessControlState, caller)) {
      shoppingListList.toArray();
    } else {
      shoppingListList.filter(func(list) { list.ownerId == caller }).toArray();
    };

    filteredLists.sort(ShoppingList.compareById);
  };

  public shared ({ caller }) func updateDocument(id : Nat, name : Text, format : Text, fileSize : Nat, file : Text, projectId : Nat, docType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canModifyProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have permission to update documents for this project");
        };
      };
    };

    let newDocument = {
      id;
      name;
      format;
      fileSize;
      file;
      projectId;
      docType;
    };
    documentList.add(newDocument);
  };

  public query ({ caller }) func getDocuments(projectId : Nat) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canAccessProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have access to this project");
        };
      };
    };

    let filteredDocuments = documentList.toArray().filter(func(doc) { doc.projectId == projectId }).sort(Document.compareById);
    filteredDocuments;
  };

  public shared ({ caller }) func addToProductLibrary(id : Nat, name : Text, image : Text, price : Nat, shop : Text, description : Text, type_ : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (not isDesignerOrManager(caller)) {
      Runtime.trap("Unauthorized: Only designers and managers can add to product library");
    };

    let newProductLibraryItem = {
      id;
      name;
      image;
      price;
      shop;
      description;
      type_;
      ownerId = caller;
    };
    productLibraryList.add(newProductLibraryItem);
  };

  public query ({ caller }) func getProductLibrary() : async [ProductLibrary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    productLibraryList.toArray();
  };

  public shared ({ caller }) func addRoom(projectId : Nat, id : Nat, name : Text, area : Nat, notes : Text, category : Text, budget : Nat, products : [Product]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (projectList.values().find(func(project) { project.id == projectId })) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (not canModifyProject(caller, project)) {
          Runtime.trap("Unauthorized: You don't have permission to modify this project");
        };

        let newRoom = {
          id;
          name;
          area;
          notes;
          category;
          budget;
          products;
        };
        let updatedRooms = project.rooms.concat([newRoom]);
        let updatedProject = {
          id = project.id;
          name = project.name;
          clientId = project.clientId;
          timeline = project.timeline;
          budget = project.budget;
          status = project.status;
          rooms = updatedRooms;
          ownerId = project.ownerId;
          sharedWithClients = project.sharedWithClients;
        };

        updateProjectInList(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func addMaterial(id : Nat, name : Text, description : Text, image : Text, format : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (not isDesignerOrManager(caller)) {
      Runtime.trap("Unauthorized: Only designers and managers can add materials");
    };

    let newMaterial = {
      id;
      name;
      description;
      image;
      format;
      price;
    };
    materialList.add(newMaterial);
  };

  public query ({ caller }) func getMaterialsByIds(ids : [Nat]) : async [Material] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let values = materialList.toArray();
    values.filter<Material>(func(material) {
      ids.find<Nat>(func(id) { id == material.id }) != null;
    });
  };

  public query ({ caller }) func getAllUserData() : async AllUserData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?userProfile) {
        let projects = getProjectsByUser(caller);
        let tasks = getTasksByUser(caller);
        let moodboards = getMoodboardsByUser(caller);
        let shoppingLists = getShoppingListsByUser(caller);
        let productLibrary = getProductLibraryByUser(caller);

        {
          userProfile;
          projects;
          tasks;
          moodboards;
          shoppingLists;
          productLibrary;
        };
      };
    };
  };

  public query ({ caller }) func getAllUsersData() : async [AllUserData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all users' data");
    };

    let allUserData = List.empty<AllUserData>();

    userProfiles.entries().forEach(func(entry) {
      let (user, userProfile) = entry;
      let projects = getProjectsByUser(user);
      let tasks = getTasksByUser(user);
      let moodboards = getMoodboardsByUser(user);
      let shoppingLists = getShoppingListsByUser(user);
      allUserData.add({
        userProfile;
        projects;
        tasks;
        moodboards;
        shoppingLists;
        productLibrary = getProductLibraryByUser(user);
      });
    });

    allUserData.toArray();
  };

  func getProjectsByUser(user : Principal) : [Project] {
    let filteredProjects = projectList.toArray().filter(func(project) {
      canAccessProject(user, project);
    });
    filteredProjects.sort(Project.compareById);
  };

  func getTasksByUser(user : Principal) : [Task] {
    let filteredTasks = taskList.toArray().filter(func(task) {
      task.ownerId == user or AccessControl.isAdmin(accessControlState, user);
    });
    filteredTasks.sort(Task.compareById);
  };

  func getMoodboardsByUser(user : Principal) : [Moodboard] {
    let accessibleProjects = projectList.filter(func(project) {
      canAccessProject(user, project);
    });

    let filteredMoodboards = moodboardList.toArray().filter(func(moodboard) {
      accessibleProjects.values().find(func(project) { project.id == moodboard.projectId }) != null;
    });
    filteredMoodboards.sort(Moodboard.compareById);
  };

  func getShoppingListsByUser(user : Principal) : [ShoppingList] {
    let filteredShoppingLists = shoppingListList.toArray().filter(func(shoppingList) {
      shoppingList.ownerId == user or AccessControl.isAdmin(accessControlState, user);
    });
    filteredShoppingLists.sort(ShoppingList.compareById);
  };

  func getProductLibraryByUser(user : Principal) : [ProductLibrary] {
    let filteredProductLibrary = productLibraryList.toArray().filter(func(productLibrary) {
      productLibrary.ownerId == user or AccessControl.isAdmin(accessControlState, user);
    });
    filteredProductLibrary.sort(ProductLibrary.compareById);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };
};
