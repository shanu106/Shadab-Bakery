import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  doneTasks: Task[] = [];

  searchText: string = '';
  currentView: string = 'laptop';

  showTaskModal = false;
  isEditMode = false;

  taskForm: Task = {
    id: 0,
    title: '',
    description: '',
    status: 'todo'
  };

  ngOnInit() {
    this.allTasks = [
      { id: 1, title: 'Setup Angular Project', description: 'Initialize the Angular project with CDK', status: 'done' },
      { id: 2, title: 'Create Kanban Board', description: 'Design the UI for the Kanban board', status: 'inprogress' },
      { id: 3, title: 'Implement Drag & Drop', description: 'Add drag and drop functionality using Angular CDK', status: 'inprogress' },
      { id: 4, title: 'Add Task Modal', description: 'Create modal for adding and editing tasks', status: 'todo' },
      { id: 5, title: 'Style Components', description: 'Apply modern CSS styling to the board', status: 'todo' },
      { id: 6, title: 'Test Functionality', description: 'Test drag and drop between all columns', status: 'todo' }
    ];
    this.updateFilteredTasks();
  }

  updateFilteredTasks() {
    const filtered = this.allTasks.filter(task => this.taskMatchesSearch(task));
    this.todoTasks = filtered.filter(t => t.status === 'todo');
    this.inprogressTasks = filtered.filter(t => t.status === 'inprogress');
    this.doneTasks = filtered.filter(t => t.status === 'done');
  }

  filterTasks() {
    this.updateFilteredTasks();
  }

  taskMatchesSearch(task: Task): boolean {
    if (!this.searchText) return true;
    const text = this.searchText.toLowerCase();
    return task.title.toLowerCase().includes(text) || task.description.toLowerCase().includes(text);
  }

  openAddTaskModal() {
    this.isEditMode = false;
    this.taskForm = { id: 0, title: '', description: '', status: 'todo' };
    this.showTaskModal = true;
  }

  editTask(task: Task) {
    this.isEditMode = true;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  saveTask() {
    if (this.isEditMode) {
      const index = this.allTasks.findIndex(t => t.id === this.taskForm.id);
      this.allTasks[index] = { ...this.taskForm };
    } else {
      this.taskForm.id = Date.now();
      this.allTasks.push({ ...this.taskForm });
    }

    this.filterTasks();
    this.closeModal();
  }

  closeModal() {
    this.showTaskModal = false;
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      if (event.container.id === 'todo-list') {
        task.status = 'todo';
      } else if (event.container.id === 'inprogress-list') {
        task.status = 'inprogress';
      } else if (event.container.id === 'done-list') {
        task.status = 'done';
      }
    }
  }

  toggleTheme() {
    document.body.classList.toggle('dark-theme');
  }

  deleteTask(task: Task) {
    const index = this.allTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.allTasks.splice(index, 1);
      this.updateFilteredTasks();
    }
  }

  setView(view: string) {
    this.currentView = view;
  }

  addTaskFromSearch() {
    if (this.searchText.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: this.searchText.trim(),
        description: '',
        status: 'todo'
      };
      this.allTasks.push(newTask);
      this.searchText = '';
      this.updateFilteredTasks();
    }
  }

  moveToInProgress(task: Task) {
    task.status = 'inprogress';
    this.updateFilteredTasks();
  }

  moveToDone(task: Task) {
    task.status = 'done';
    this.updateFilteredTasks();
  }

  moveToTodo(task: Task) {
    task.status = 'todo';
    this.updateFilteredTasks();
  }
}
