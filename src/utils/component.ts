import { Component } from "../Component";
import { ComponentConstructor } from "../Entity";

// export function orderComponentsByDependencies(
//   components: Component[]
// ): Component[] {
//   const sortedComponents: Component[] = [];

//   const visited = new Set();
//   const visiting = new Set();

//   function visit(component: Component) {
//     if (visited.has(component)) {
//       return;
//     }

//     if (visiting.has(component)) {
//       throw new Error("Circular dependency detected");
//     }

//     visiting.add(component);

//     let dependencyTypes: ComponentConstructor<Component>[] = [];
//     if (component.getComponentDependencies) {
//       dependencyTypes = component.getComponentDependencies();
//     } else dependencyTypes = [];

//     const dependencies = dependencyTypes.map((type) => {
//       const c = components.find((c) => c instanceof type);
//       if (!c) {
//         throw new Error(
//           `Component ${component.constructor.name} requires component ${type.name} but it was not found`
//         );
//       }
//       return c;
//     });

//     if (dependencies) {
//       dependencies.forEach(visit);
//     }

//     visited.add(component);
//     visiting.delete(component);

//     sortedComponents.push(component);
//   }

//   components.forEach(visit);

//   return sortedComponents;
// }
